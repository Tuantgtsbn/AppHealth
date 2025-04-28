import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import userReducer from './userSlice';
import deviceReducer from './deviceSlice';
import emailReducer from './emailSlice';
import articleReducer from './articleSlice';
import connectDeviceReducer from './connectDeviceSlice';
export const store = configureStore({
    reducer: {
        auth: authReducer,
        user: userReducer,
        device: deviceReducer,
        email: emailReducer,
        article: articleReducer,
        connectDevice: connectDeviceReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
