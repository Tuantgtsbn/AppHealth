import AsyncStorage from '@react-native-async-storage/async-storage';
import { Timestamp } from 'firebase/firestore';
// import { sendDataSensorIntoFirestore } from '../../services/sensor.service';

import DataSensor from '../../types/dataSensor.types';
const OFFLINE_STORAGE_KEY = 'offline_data';

/**
 * Lưu dữ liệu cảm biến vào bộ nhớ cục bộ khi không có kết nối mạng
 * @param data Dữ liệu cảm biến cần lưu
 * @returns Promise<boolean> Kết quả lưu trữ
 */
export const saveOfflineSensorData = async (
    data: DataSensor
): Promise<boolean> => {
    try {
        const storableData = {
            ...data,
            createdAt: data.createdAt.toDate().toISOString()
        };

        const existingDataStr = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
        const existingData = existingDataStr ? JSON.parse(existingDataStr) : [];
        existingData.push(storableData);
        await AsyncStorage.setItem(
            OFFLINE_STORAGE_KEY,
            JSON.stringify(existingData)
        );
        return true;
    } catch (error) {
        console.error('Error saving offline data:', error);
        return false;
    }
};

/**
 * Đồng bộ dữ liệu cảm biến từ bộ nhớ cục bộ lên Firebase khi có kết nối mạng
 * @param sendToFirestore Hàm gửi dữ liệu lên Firestore
 * @returns Promise<{success: number, failed: number}> Số lượng bản ghi thành công và thất bại
 */
export const syncOfflineSensorData = async (
    sendToFirestore: (data: DataSensor) => Promise<string>
): Promise<{
    success: number;
    failed: number;
}> => {
    try {
        // Lấy dữ liệu từ bộ nhớ cục bộ
        const offlineDataStr = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
        if (!offlineDataStr) {
            console.log('Không có dữ liệu offline để đồng bộ');
            return { success: 0, failed: 0 };
        }

        const offlineData = JSON.parse(offlineDataStr);
        console.log(
            `Bắt đầu đồng bộ ${offlineData.length} bản ghi dữ liệu cảm biến`
        );

        let successCount = 0;
        let failedCount = 0;
        const failedItems = [];

        // Đồng bộ từng bản ghi lên Firebase
        for (const item of offlineData) {
            try {
                // Chuyển đổi chuỗi ISO thành Timestamp
                const firestoreData = {
                    ...item,
                    createdAt: Timestamp.fromDate(new Date(item.createdAt))
                };

                // Gửi dữ liệu lên Firebase sử dụng hàm được truyền vào
                await sendToFirestore(firestoreData);
                successCount++;
            } catch (error) {
                console.error('Lỗi khi đồng bộ bản ghi:', error);
                failedItems.push(item);
                failedCount++;
            }
        }

        // Nếu còn bản ghi thất bại, lưu lại để thử lại sau
        if (failedItems.length > 0) {
            await AsyncStorage.setItem(
                OFFLINE_STORAGE_KEY,
                JSON.stringify(failedItems)
            );
            console.log(`Còn ${failedItems.length} bản ghi chưa đồng bộ được`);
        } else {
            // Xóa dữ liệu đã đồng bộ thành công
            await AsyncStorage.removeItem(OFFLINE_STORAGE_KEY);
            console.log('Đã đồng bộ tất cả dữ liệu offline');
        }

        return { success: successCount, failed: failedCount };
    } catch (error) {
        console.error('Lỗi khi đồng bộ dữ liệu cảm biến:', error);
        return { success: 0, failed: 0 };
    }
};
/**
 * Kiểm tra số lượng bản ghi đang chờ đồng bộ
 * @returns Promise<number> Số lượng bản ghi đang chờ
 */
export const getPendingSyncCount = async (): Promise<number> => {
    try {
        const offlineDataStr = await AsyncStorage.getItem(OFFLINE_STORAGE_KEY);
        if (!offlineDataStr) return 0;

        const offlineData = JSON.parse(offlineDataStr);
        return offlineData.length;
    } catch (error) {
        console.error('Lỗi khi kiểm tra dữ liệu chờ đồng bộ:', error);
        return 0;
    }
};
