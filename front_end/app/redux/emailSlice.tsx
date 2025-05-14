import { db } from '@config/firebase';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';

interface Email {
    id: string;
    email: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

interface EmailState {
    emails: Email[];
    loading: boolean;
    error: string | null;
}

const initialState: EmailState = {
    emails: [],
    loading: false,
    error: null
};
export const fetchUserEmails = createAsyncThunk(
    'email/fetchUserEmails',
    async (userId: string, { rejectWithValue }) => {
        try {
            // Lấy danh sách email của người dùng từ Firestore
            const emailRef = collection(db, 'AlertEmails');
            const q = query(
                emailRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'asc')
            );
            const querySnapshot = await getDocs(q);
            const emails = querySnapshot.docs.map((doc) => {
                const tmp = doc.data();
                return {
                    id: doc.id,
                    ...tmp,
                    createdAt: tmp.createdAt?.toDate().toISOString(),
                    updatedAt: tmp.updatedAt?.toDate().toISOString()
                };
            }) as Email[];
            return emails;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const addEmail = createAsyncThunk(
    'email/addEmail',
    async (
        { userId, email }: { userId: string; email: string },
        { rejectWithValue }
    ) => {
        try {
            // Thêm email mới vào Firestore
            const emailRef = collection(db, 'AlertEmails');
            const newEmail = {
                email,
                userId,
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            };
            // Kiểm tra email đã tồn tại hay chưa
            const q = query(emailRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error('Email đã tồn tại');
            }
            const docRef = await addDoc(emailRef, newEmail);
            const newEmailDoc = await getDoc(docRef);
            const newEmailData = newEmailDoc.data();
            if (!newEmailDoc.exists()) {
                throw new Error('Lỗi khi thêm email');
            }

            return {
                id: docRef.id,
                ...newEmailData,
                createdAt: newEmailData.createdAt?.toDate().toISOString(),
                updatedAt: newEmailData.updatedAt?.toDate().toISOString()
            } as Email;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateEmail = createAsyncThunk(
    'email/updateEmail',
    async (
        {
            emailId,
            newEmail,
            userId
        }: { emailId: string; newEmail: string; userId: string },
        { rejectWithValue }
    ) => {
        try {
            // Cập nhật email trong Firestore
            const emailRef = doc(db, 'AlertEmails', emailId);
            const updatedEmail = await getDoc(emailRef);
            if (!updatedEmail.exists()) {
                throw new Error('Không tìm thấy email');
            }
            // Kiểm tra email đã tồn tại hay chưa
            const q = query(
                collection(db, 'Emails'),
                where('email', '==', newEmail)
            );
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                throw new Error('Email đã tồn tại');
            }
            await updateDoc(emailRef, {
                email: newEmail,
                userId,
                updatedAt: Timestamp.now()
            });
            const updatedEmailDoc = await getDoc(emailRef);
            const updatedEmailData = updatedEmailDoc.data();
            return {
                id: emailId,
                ...updatedEmailData,
                createdAt: updatedEmailData.createdAt?.toDate().toISOString(),
                updatedAt: updatedEmailData.updatedAt?.toDate().toISOString()
            } as Email;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const deleteEmail = createAsyncThunk(
    'email/deleteEmail',
    async (emailId: string, { rejectWithValue }) => {
        try {
            // Xóa email khỏi Firestore
            const emailRef = doc(db, 'AlertEmails', emailId);
            await deleteDoc(emailRef);
            return emailId;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const emailSlice = createSlice({
    name: 'email',
    initialState,
    reducers: {},
    extraReducers(builder) {
        // Fetch emails
        builder
            .addCase(fetchUserEmails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserEmails.fulfilled, (state, action) => {
                state.loading = false;
                state.emails = action.payload;
            })
            .addCase(fetchUserEmails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Add email
        builder
            .addCase(addEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.emails.push(action.payload);
            })
            .addCase(addEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update email
        builder
            .addCase(updateEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmail.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.emails.findIndex(
                    (email) => email.id === action.payload.id
                );
                if (index !== -1) {
                    state.emails[index] = action.payload;
                }
            })
            .addCase(updateEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete email
        builder
            .addCase(deleteEmail.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEmail.fulfilled, (state, action) => {
                state.loading = false;
                state.emails = state.emails.filter(
                    (email) => email.id !== action.payload
                );
            })
            .addCase(deleteEmail.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default emailSlice.reducer;
