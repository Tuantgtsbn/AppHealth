import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, getDoc, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from '@config/firebase';
type threshold = {
    min: number;
    max: number;
};
type detailUser = {
    id: string;
    gender: string | null;
    dateOfBirth: string | null;
    weight: any;
    height: any;
    has_hypertension: boolean;
    has_diabetes: boolean;
    avater: string;
    email: string;
    nameDisplay: string;
    phone?: string;
    created_at?: string;
    updated_at?: string;
    emailNotifications: boolean;
    soundAlerts?: string;
    heartRateThreshold: threshold;
    spo2Threshold: threshold;
};
interface UserState {
    detailUser: detailUser;
    loading: boolean;
    error: string | null;
}

const initialState = {
    detailUser: {
        id: '',
        gender: null,
        dateOfBirth: null,
        weight: null,
        height: null,
        has_hypertension: false,
        has_diabetes: false,
        avatar: '',
        email: '',
        nameDisplay: '',
        phone: '',
        heartRateThreshold: {
            min: 60,
            max: 100
        },
        spo2Threshold: {
            min: 95,
            max: 100
        },
        emailNotifications: true,
        soundAlerts: 'silent'
    },
    loading: false,
    error: null
};
export const getUserProfile = createAsyncThunk(
    'user/getProfile',
    async (id: string, { rejectWithValue }) => {
        try {
            const userRef = doc(db, 'Users', id);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const userData = userSnap.data();
                return {
                    ...userData,
                    created_at: userData.created_at.toDate().toISOString(),
                    updated_at: userData.updated_at.toDate().toISOString()
                };
            } else {
                return rejectWithValue('User not found');
            }
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (
        { id, profileData }: { id: string; profileData: any },
        { rejectWithValue }
    ) => {
        try {
            if (!id) {
                throw new Error('User ID is required');
            }

            const userRef = doc(db, 'Users', id);

            // Cập nhật dữ liệu
            await updateDoc(userRef, {
                ...profileData,
                updated_at: Timestamp.now()
            });

            // Lấy dữ liệu mới
            const updateSnap = await getDoc(userRef);

            if (!updateSnap.exists()) {
                throw new Error('User not found');
            }
            const updatedData = updateSnap.data();
            return {
                ...updatedData,
                created_at: updatedData.created_at.toDate().toISOString(),
                updated_at: updatedData.updated_at.toDate().toISOString()
            };
        } catch (error: any) {
            console.error('Update profile error:', error);
            return rejectWithValue(error.message || 'Failed to update profile');
        }
    }
);
export const firstCompleteUserProfile = createAsyncThunk(
    'user/firstCompleteUserProfile',
    async (
        { id, profileData }: { id: string; profileData: any },
        { rejectWithValue }
    ) => {
        try {
            if (!id) {
                throw new Error('User ID is required');
            }

            const userRef = doc(db, 'Users', id);

            // Cập nhật dữ liệu
            await updateDoc(userRef, {
                ...profileData,
                updated_at: Timestamp.now(),
                heartRateThreshold: {
                    min: 60,
                    max: 100
                },
                spo2Threshold: {
                    min: 95,
                    max: 100
                },
                emailNotifications: true,
                soundAlerts: 'silent'
            });

            // Lấy dữ liệu mới
            const updateSnap = await getDoc(userRef);

            if (!updateSnap.exists()) {
                throw new Error('User not found');
            }
            const updatedData = updateSnap.data();
            return {
                ...updatedData,
                created_at: updatedData.created_at.toDate().toISOString(),
                updated_at: updatedData.updated_at.toDate().toISOString()
            };
        } catch (error: any) {
            console.error('Update profile error:', error);
            return rejectWithValue(error.message || 'Failed to update profile');
        }
    }
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUserId: (state, action) => {
            state.detailUser.id = action.payload;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.detailUser = action.payload;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Có lỗi xảy ra';
            })
            .addCase(getUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.detailUser = action.payload;
            })
            .addCase(getUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Có lỗi xảy ra';
            })
            .addCase(firstCompleteUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(firstCompleteUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.detailUser = action.payload;
            })
            .addCase(firstCompleteUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || 'Có lỗi xảy ra';
            });
    }
});

export const { setUserId } = userSlice.actions;
export default userSlice.reducer;
