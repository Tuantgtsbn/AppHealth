import {
    getDocs,
    limit,
    orderBy,
    query,
    Timestamp,
    where
} from 'firebase/firestore';
import moment from 'moment';
import 'moment/locale/vi';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@config/firebase';
import {
    saveOfflineSensorData,
    syncOfflineSensorData
} from '../app/utils/storageDataSensor';
import NetInfo from '@react-native-community/netinfo';
import DataSensor from '../types/dataSensor.types';
moment.locale('vi');

export const fakeDataFromSensor = (userId, sensorId) => {
    return {
        userId,
        sensorId,
        createdAt: Timestamp.now(),
        heartRate: Math.floor(40 + Math.random() * 61),
        spo2: Math.floor(80 + Math.random() * 21)
    };
};

export const sendDataSensorIntoFirestore = async (data: DataSensor) => {
    try {
        // Kiểm tra kết nối mạng trước khi gửi dữ liệu
        const networkState = await NetInfo.fetch();
        const isConnected = Boolean(
            networkState.isConnected && networkState.isInternetReachable
        );

        if (!isConnected) {
            // Nếu không có kết nối mạng, lưu dữ liệu vào bộ nhớ cục bộ
            console.log('Không có kết nối mạng, lưu dữ liệu vào bộ nhớ cục bộ');
            await saveOfflineSensorData(data);
            return 'offline_' + Date.now(); // Trả về ID tạm thời
        }

        // Nếu có kết nối mạng, gửi dữ liệu lên Firestore
        const docRef = await addDoc(collection(db, 'DataSensors'), data);
        console.log('Gửi dữ liệu thành công với ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        // Nếu gặp lỗi khi gửi lên Firestore, thử lưu vào bộ nhớ cục bộ
        console.error('Lỗi khi gửi dữ liệu vào Firestore:', error);
        try {
            await saveOfflineSensorData(data);
            return 'offline_error_' + Date.now();
        } catch (offlineError) {
            console.error('Lỗi khi lưu dữ liệu offline:', offlineError);
            throw new Error(
                'Lỗi khi gửi dữ liệu: không thể lưu online hoặc offline'
            );
        }
    }
};

// Hàm mới để đồng bộ dữ liệu
export const syncOfflineData = async () => {
    return await syncOfflineSensorData(sendDataSensorIntoFirestore);
};

export const getLatestSensorData = async (userId: string) => {
    try {
        const healthQuery = query(
            collection(db, 'DataSensors'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(1)
        );
        const querySnapshot = await getDocs(healthQuery);
        if (querySnapshot.empty) {
            return null;
        }
        const latestData = querySnapshot.docs[0].data();
        console.log('Lay du lieu moi nhat', latestData);
        return latestData;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu mới nhất:', error);
        return null;
    }
};
