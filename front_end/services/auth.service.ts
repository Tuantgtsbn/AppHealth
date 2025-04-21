import {
    createUserWithEmailAndPassword,
    signInWithCredential,
    signOut,
    FacebookAuthProvider,
    UserCredential,
    signInWithEmailAndPassword
} from 'firebase/auth';
import { auth, facebookProvider, db } from '@config/firebase';
import { User, RegisterCredentials } from '@types/user.types';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import * as WebBrowser from 'expo-web-browser';
WebBrowser.maybeCompleteAuthSession();
export class AuthService {
    static async registerWithEmailAndPassword(
        credentials: RegisterCredentials
    ): Promise<UserCredential> {
        try {
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );
            await setDoc(
                doc(db, 'Users', userCredential.user.uid),
                {
                    id: userCredential.user.uid,
                    email: credentials.email,
                    password: credentials.password,
                    lastName: credentials.lastName,
                    firstName: credentials.firstName,
                    nameDisplay:
                        credentials.firstName + ' ' + credentials.lastName,
                    has_hypertension: false,
                    has_diabetes: false,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp()
                },
                { merge: true }
            );
            return userCredential;
        } catch (error: any) {
            console.log('Register error:', error);
            // Xử lý các loại lỗi cụ thể
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Email này đã được sử dụng');
            }
            if (error.code === 'auth/invalid-email') {
                throw new Error('Email không hợp lệ');
            }
            if (error.code === 'auth/operation-not-allowed') {
                throw new Error(
                    'Chức năng đăng ký email/password chưa được kích hoạt'
                );
            }
            if (error.code === 'auth/weak-password') {
                throw new Error('Mật khẩu không đủ mạnh');
            }
            if (error.code === 'permission-denied') {
                throw new Error('Không có quyền truy cập. Vui lòng thử lại');
            }

            // Nếu là lỗi khác
            throw new Error('Đã có lỗi xảy ra trong quá trình đăng ký');
        }
    }
    static async signInWithEmailAndPassword(credentials: {
        email: string;
        password: string;
    }): Promise<UserCredential> {
        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                credentials.email,
                credentials.password
            );
            return userCredential;
        } catch (error: any) {
            console.log('Login error:', error);

            if (error.code === 'auth/invalid-email') {
                throw new Error('Email không hợp lệ');
            }
            if (error.code === 'auth/user-disabled') {
                throw new Error('Tài khoản đã bị vô hiệu hóa');
            }
            if (error.code === 'auth/user-not-found') {
                throw new Error('Không tìm thấy tài khoản với email này');
            }
            if (error.code === 'auth/wrong-password') {
                throw new Error('Mật khẩu không chính xác');
            }

            throw new Error('Đã có lỗi xảy ra trong quá trình đăng nhập');
        }
    }

    static async signInWithGoogleCredential(credential: any) {
        try {
            // Đăng nhập vào Firebase với credential
            const userCredential = await signInWithCredential(auth, credential);

            // Kiểm tra và tạo document user trong Firestore nếu chưa tồn tại
            const userRef = doc(db, 'Users', userCredential.user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                const names = userCredential.user.displayName?.split(' ') || [
                    ''
                ];
                const lastName = names.pop() || '';
                const firstName = names.join(' ');

                await setDoc(userRef, {
                    id: userCredential.user.uid,
                    email: userCredential.user.email,
                    firstName: firstName,
                    lastName: lastName,
                    nameDisplay: userCredential.user.displayName,
                    has_hypertension: false,
                    has_diabetes: false,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp()
                });
            }

            return userCredential;
        } catch (error) {
            console.error('Google Sign-In Error:', error);
            throw new Error('Đăng nhập bằng Google thất bại');
        }
    }

    static async signInWithFacebook(): Promise<UserCredential> {
        try {
            const result = await signInWithPopup(auth, facebookProvider);

            const userRef = doc(db, 'Users', result.user.uid);
            const userSnap = await getDoc(userRef);
            if (!userSnap.exists()) {
                await setDoc(userRef, {
                    id: result.user.uid,
                    firstName: result.user.displayName?.split(' ')[0] || '',
                    lastName:
                        result.user.displayName
                            ?.split(' ')
                            .slice(1)
                            .join(' ') || '',
                    email: result.user.email,
                    nameDisplay: result.user.displayName,
                    has_hypertension: false,
                    has_diabetes: false,
                    created_at: serverTimestamp(),
                    updated_at: serverTimestamp()
                });
            }
            // This gives you a Facebook Access Token
            const credential =
                FacebookAuthProvider.credentialFromResult(result);
            const token = credential?.accessToken;
            // The signed-in user info
            const user = result.user;
            return result;
        } catch (error: any) {
            // Handle Errors here
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used
            const email = error.customData?.email;
            // The AuthCredential type that was used
            const credential = FacebookAuthProvider.credentialFromError(error);
            throw error;
        }
    }

    static async signOut(): Promise<void> {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Sign out error:', error);
            throw error;
        }
    }
}
