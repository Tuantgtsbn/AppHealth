import {
    getDetailNotification,
    getListNotification
} from '@services/notification.service';
import { NotificationData } from '../../types/notification.types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
type NotificationState = {
    notifications: NotificationData[];
    loading: boolean;
    error: string | null;
    loadingDetail: boolean;
    detailNotification: NotificationData | null;
};
const initialState = {
    notifications: [],
    loading: false,
    error: null,
    loadingDetail: false,
    detailNotification: null
};

export const getNotis = createAsyncThunk(
    'notification/getNotifications',
    async (userId: string, { rejectWithValue }) => {
        try {
            const notifications = await getListNotification(userId);
            console.log('Danh sach thong bao', notifications);
            return notifications;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const getDetailNoti = createAsyncThunk(
    'notification/getDetailNotification',
    async (notificationId: string, { rejectWithValue }) => {
        try {
            const notification = await getDetailNotification(notificationId);
            return notification;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

const notificationSlice = createSlice({
    name: 'notification',
    initialState,
    reducers: {},
    extraReducers(builder) {
        builder
            .addCase(getNotis.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getNotis.fulfilled, (state, action) => {
                state.loading = false;
                state.notifications = action.payload;
            })
            .addCase(getNotis.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getDetailNoti.pending, (state) => {
                state.loadingDetail = true;
                state.error = null;
            })
            .addCase(getDetailNoti.fulfilled, (state, action) => {
                state.loadingDetail = false;
                state.detailNotification = action.payload;
            })
            .addCase(getDetailNoti.rejected, (state, action) => {
                state.loadingDetail = false;
                state.error = action.payload as string;
            });
    }
});
export default notificationSlice.reducer;
