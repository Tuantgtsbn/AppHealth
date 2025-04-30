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
    updateDoc,
    where
} from 'firebase/firestore';

interface Device {
    id: string;
    name: string;
    userId: string;
    deviceId: string;
    createdAt: string;
    updatedAt: string;
}

interface DeviceState {
    devices: Device[];
    loading: boolean;
    error: string | null;
}

const initialState: DeviceState = {
    devices: [],
    loading: false,
    error: null
};
export const fetchUserDevices = createAsyncThunk(
    'device/fetchUserDevices',
    async (userId: string, { rejectWithValue }) => {
        try {
            const devicesRef = collection(db, 'LinkedDevices');
            const q = query(
                devicesRef,
                where('userId', '==', userId),
                orderBy('createdAt', 'asc')
            );
            const querySnapshot = await getDocs(q);
            const devices = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            })) as Device[];
            return devices;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
export const addDevice = createAsyncThunk(
    'device/addDevice',
    async (
        { userId, deviceData }: { userId: string; deviceData: Partial<Device> },
        { rejectWithValue }
    ) => {
        try {
            const deviceRef = collection(db, 'Devices');
            const newDevice = {
                ...deviceData,
                userId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            const docRef = await addDoc(deviceRef, newDevice);
            const newDeviceDoc = await getDoc(docRef);
            if (!newDeviceDoc.exists()) {
                throw new Error('Lỗi khi thêm thiết bị');
            }
            const newDeviceData = newDeviceDoc.data();
            return {
                ...newDeviceData,
                id: docRef.id
            } as Device;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);

export const updateDevice = createAsyncThunk(
    'device/updateDeviceName',
    async (
        {
            deviceId,
            updateValues
        }: { deviceId: string; updateValues: Partial<Device> },
        { rejectWithValue }
    ) => {
        try {
            const deviceRef = doc(db, 'Devices', deviceId);
            const updatedDevice = await getDoc(deviceRef);
            if (!updatedDevice.exists()) {
                throw new Error('Không tìm thấy thiết bị');
            }
            await updateDoc(deviceRef, {
                ...updateValues,
                updatedAt: new Date().toISOString()
            });
            const updatedDeviceDoc = await getDoc(deviceRef);
            const updatedDeviceData = updatedDeviceDoc.data();
            return {
                id: deviceId,
                ...updatedDeviceData
            } as Device;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
export const deleteDevice = createAsyncThunk(
    'device/deleteDevice',
    async (deviceId: string, { rejectWithValue }) => {
        try {
            const deviceRef = doc(db, 'Devices', deviceId);
            await deleteDoc(deviceRef);
            return deviceId;
        } catch (error: any) {
            return rejectWithValue(error.message);
        }
    }
);
const deviceSlice = createSlice({
    name: 'device',
    initialState,
    reducers: {},
    extraReducers(builder) {
        // Fetch user devices
        builder
            .addCase(fetchUserDevices.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserDevices.fulfilled, (state, action) => {
                state.loading = false;
                state.devices = action.payload;
            })
            .addCase(fetchUserDevices.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Add device
        builder
            .addCase(addDevice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addDevice.fulfilled, (state, action) => {
                state.loading = false;
                state.devices.push(action.payload);
            })
            .addCase(addDevice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Update device
        builder
            .addCase(updateDevice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateDevice.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.devices.findIndex(
                    (device) => device.id === action.payload.id
                );
                if (index !== -1) {
                    state.devices[index] = action.payload;
                }
            })
            .addCase(updateDevice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });

        // Delete device
        builder
            .addCase(deleteDevice.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteDevice.fulfilled, (state, action) => {
                state.loading = false;
                state.devices = state.devices.filter(
                    (device) => device.id !== action.payload
                );
            })
            .addCase(deleteDevice.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export default deviceSlice.reducer;
