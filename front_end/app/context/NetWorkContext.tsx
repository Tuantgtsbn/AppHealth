import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import {
    getPendingSyncCount,
    syncOfflineSensorData
} from '@/utils/storageDataSensor';

// Định nghĩa kiểu dữ liệu cho context
type NetworkContextType = {
    isConnected: boolean;
    checkConnection: () => Promise<boolean>;
    pendingSyncCount: number;
    syncOfflineData: () => Promise<{ success: number; failed: number }>;
};

// Tạo context với giá trị mặc định
const NetworkContext = createContext<NetworkContextType>({
    isConnected: true,
    checkConnection: async () => true,
    pendingSyncCount: 0,
    syncOfflineData: async () => ({ success: 0, failed: 0 })
});

// Hook tùy chỉnh để sử dụng context
export const useNetwork = () => useContext(NetworkContext);

// Provider component
export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [pendingSyncCount, setPendingSyncCount] = useState<number>(0);
    const [lastConnectionState, setLastConnectionState] =
        useState<boolean>(true);

    // Hàm kiểm tra kết nối mạng
    const checkConnection = async (): Promise<boolean> => {
        try {
            const state = await NetInfo.fetch();
            const connected = Boolean(
                state.isConnected && state.isInternetReachable
            );
            setIsConnected(connected);
            return connected;
        } catch (error) {
            console.error('Lỗi khi kiểm tra kết nối mạng:', error);
            setIsConnected(false);
            return false;
        }
    };

    useEffect(() => {
        // Kiểm tra kết nối ban đầu
        checkConnection();
        updatePendingSyncCount();
        // Đăng ký lắng nghe sự thay đổi kết nối
        const unsubscribe = NetInfo.addEventListener((state) => {
            const connected = Boolean(
                state.isConnected && state.isInternetReachable
            );
            //Nếu kết nối được khôi phục, thử đồng bộ dữ liệu
            if (connected && !lastConnectionState) {
                syncOfflineData();
            }
            setIsConnected(connected);
            setLastConnectionState(connected);
        });
        // Thiết lập kiểm tra định kỳ số lượng bản ghi đang chờ
        const intervalId = setInterval(updatePendingSyncCount, 60000); // Kiểm tra mỗi phút
        // Hủy đăng ký khi component unmount
        return () => {
            clearInterval(intervalId);
            unsubscribe();
        };
    }, []);
    // Hàm đồng bộ dữ liệu offline
    const syncOfflineData = async () => {
        if (!isConnected) {
            return { success: 0, failed: 0 };
        }
        const result = await syncOfflineSensorData();
        setPendingSyncCount(result.failed);
        return result;
    };
    // Cập nhật số lượng bản ghi đang chờ đồng bộ
    const updatePendingSyncCount = async () => {
        const count = await getPendingSyncCount();
        setPendingSyncCount(count);
    };
    // Giá trị được cung cấp cho context
    const value = {
        isConnected,
        checkConnection,
        pendingSyncCount,
        syncOfflineData
    };

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
};
