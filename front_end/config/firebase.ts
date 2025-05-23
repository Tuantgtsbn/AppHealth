import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Đúng
import { initializeApp } from 'firebase/app';
import {
    GoogleAuthProvider,
    FacebookAuthProvider,
    initializeAuth,
    getAuth,
    onAuthStateChanged
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: 'AIzaSyDKOZEVJZveUw1biL_qGfbDefqfIQdOEg0',
    authDomain: 'heart-rate-backend.firebaseapp.com',
    projectId: 'heart-rate-backend',
    storageBucket: 'heart-rate-backend.firebasestorage.app',
    messagingSenderId: '374695925057',
    appId: '1:374695925057:web:68ee174f27662a0708fdc0',
    measurementId: 'G-3S4X2MKM05'
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Lắng nghe thay đổi trạng thái đăng nhập
onAuthStateChanged(auth, async (user) => {
    await saveUserToStorage(user);
});
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const facebookProvider = new FacebookAuthProvider();
export const storage = getStorage(app);
// Hàm lưu user vào AsyncStorage
export const saveUserToStorage = async (user: User | null) => {
    if (user) {
        await AsyncStorage.setItem('user', JSON.stringify(user));
    } else {
        await AsyncStorage.removeItem('user');
    }
};

// Hàm lấy user từ AsyncStorage
export const getUserFromStorage = async (): Promise<User | null> => {
    const userData = await AsyncStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
};
