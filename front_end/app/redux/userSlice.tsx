import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@config/firebase';

type detailUser = {
    id: string | null;
    gender: string | null;
    dateOfBirth: string | null;
    weight: string | null;
    height: string | null;
    has_hypertension: boolean;
    has_diabetes: boolean;
};
interface UserState {
    detailUser: detailUser;
    loading: boolean;
    error: string | null;
}

const initialState = {
    detailUser: {
        id: null,
        gender: null,
        dateOfBirth: null,
        weight: null,
        height: null,
        has_hypertension: false,
        has_diabetes: false
    },
    loading: false,
    error: null
};

export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async ({
        id,
        profileData
    }: {
        id: string;
        profileData: {
            gender: string;
            dateOfBirth: string;
            weight: string;
            height: string;
            has_hypertension: boolean;
            has_diabetes: boolean;
        };
    }) => {
        try {
            const userRef = doc(db, 'Users', id);
            await updateDoc(userRef, {
                ...profileData,
                updated_at: new Date()
            });
            return { id, ...profileData };
        } catch (error: any) {
            throw new Error(error.message);
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
                state.detailUser.gender = action.payload.gender;
                state.detailUser.dateOfBirth = action.payload.dateOfBirth;
                state.detailUser.weight = action.payload.weight;
                state.detailUser.height = action.payload.height;
                state.detailUser.has_hypertension =
                    action.payload.has_hypertension;
                state.detailUser.has_diabetes = action.payload.has_diabetes;
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Có lỗi xảy ra';
            });
    }
});

export const { setUserId } = userSlice.actions;
export default userSlice.reducer;
