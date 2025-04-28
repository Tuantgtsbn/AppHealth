import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

type ConnectedDevice = {
    id: string;
    nameDisplay: string;
    nameDefault: string;
};
const initialState = {
    isConnected: false,
    device: null,
    loading: false,
    error: null
};

export type ConnectDeviceState = {
    isConnected: boolean;
    device: ConnectedDevice | null;
    loading: boolean;
    error: string | null;
};

const connectDeviceSlice = createSlice({
    name: 'connectDevice',
    initialState,
    reducers: {
        setConnectedDevice: (state, action) => {
            state.isConnected = true;
            state.device = action.payload;
            state.error = null;
            state.loading = false;
        },
        disconnectedDevice: (state) => {
            state.isConnected = false;
            state.device = null;
            state.error = null;
            state.loading = false;
        }
    },
    extraReducers(builder) {
        builder
            .addCase(connectDevice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(connectDevice.fulfilled, (state, action) => {
                state.loading = false;
                state.isConnected = true;
                state.device = action.payload;
            })
            .addCase(connectDevice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(disconnectDevice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(disconnectDevice.fulfilled, (state) => {
                state.loading = false;
                state.isConnected = false;
                state.device = null;
            })
            .addCase(disconnectDevice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const connectDevice = createAsyncThunk(
    'connectDevice/connectDevice',
    async (device: ConnectedDevice, { rejectWithValue }) => {
        try {
            // Connect to device
            return device;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const disconnectDevice = createAsyncThunk(
    'connectDevice/disconnectDevice',
    async (_, { rejectWithValue }) => {
        try {
            // Disconnect from device
            return;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export default connectDeviceSlice.reducer;
export const { setConnectedDevice, disconnectedDevice } =
    connectDeviceSlice.actions;
