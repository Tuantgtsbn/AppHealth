import { db } from '@config/firebase';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    Timestamp,
    updateDoc,
    where
} from 'firebase/firestore';
import * as Notifications from 'expo-notifications';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { NotificationData } from '../types/notification.types';
import { NotificationMode } from '@/utils/notificationSettings';
let isPlayingAlert = false;
let currentSound = null;
let currentTimeout = null;
export const getListNotification = async (userId) => {
    try {
        const ref = collection(db, 'Notifications');
        const q = query(
            ref,
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        const snapshot = await getDocs(q);
        const notifications = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            notifications.push({
                id: doc.id,
                ...data
            });
        });
        return notifications;
    } catch (error) {
        console.log(error);
        return error;
    }
};

export const getDetailNotification = async (notificationId) => {
    try {
        const ref = doc(db, 'Notifications', notificationId);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
            const data = snapshot.data();
            if (!data.status) {
                await updateDoc(ref, { status: 1 });
            }
            return {
                id: snapshot.id,
                ...data,
                status: 1
            };
        } else {
            return null;
        }
    } catch (error) {
        console.log(error);
        throw error;
    }
};
export const addNotification = async (
    data: Omit<NotificationData, 'createdAt'>
) => {
    try {
        const ref = collection(db, 'Notifications');
        const docRef = await addDoc(ref, {
            ...data,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (error) {
        console.log(error);
        throw error;
    }
};
export const playAlertSound = async () => {
    try {
        // Nếu đang phát âm thanh, không phát thêm
        if (isPlayingAlert) {
            console.log('Đang phát âm thanh cảnh báo, bỏ qua yêu cầu mới');
            return true;
        }

        isPlayingAlert = true;
        const { sound } = await Audio.Sound.createAsync(
            require('../assets/sounds/alert.wav')
        );
        currentSound = sound;

        await sound.playAsync();
        sound.setIsLoopingAsync(true); // Lặp lại âm thanh trong 10 giây

        // Phát âm thanh trong 10 giây
        currentTimeout = setTimeout(async () => {
            if (currentSound) {
                await currentSound.stopAsync();
                await currentSound.unloadAsync();
                currentSound = null;
            }
            isPlayingAlert = false;
            currentTimeout = null;
        }, 10000); // 10 giây

        return true;
    } catch (error) {
        console.error('Lỗi phát âm thanh cảnh báo:', error);
        isPlayingAlert = false;
        currentSound = null;
        if (currentTimeout) {
            clearTimeout(currentTimeout);
            currentTimeout = null;
        }
        return false;
    }
};
// Thêm hàm để dừng âm thanh cảnh báo nếu cần
export const stopAlertSound = async () => {
    if (currentSound) {
        try {
            await currentSound.stopAsync();
            await currentSound.unloadAsync();
        } catch (error) {
            console.error('Lỗi khi dừng âm thanh:', error);
        }
    }

    if (currentTimeout) {
        clearTimeout(currentTimeout);
        currentTimeout = null;
    }

    isPlayingAlert = false;
    currentSound = null;
};
// Cấu hình thông báo
export const configureNotifications = async () => {
    // Yêu cầu quyền thông báo
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
        console.log('Không có quyền thông báo!');
        return false;
    }

    // Cấu hình cách hiển thị thông báo khi ứng dụng đang chạy
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true
        })
    });

    return true;
};

// Hiển thị thông báo trên thiết bị
export const showLocalNotification = async (
    title,
    body,
    notificationMode = 'silent'
) => {
    try {
        const notificationContent = {
            title,
            body
        };

        // Thêm âm thanh nếu chế độ là 'sound'
        if (notificationMode === 'sound') {
            notificationContent.sound = 'notifications.wav';
        }

        await Notifications.scheduleNotificationAsync({
            content: notificationContent,
            trigger: null // Hiển thị ngay lập tức
        });

        // Xử lý rung nếu chế độ là 'vibration'
        if (notificationMode === 'vibration') {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            // Thêm một rung phụ sau 100ms để tạo hiệu ứng rung kép
            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 100);
        }

        return true;
    } catch (error) {
        console.error('Lỗi hiển thị thông báo:', error);
        return false;
    }
};
export const sendAlertEmail = async (userId, metricType, value) => {
    try {
        // Kiểm tra dữ liệu đầu vào
        if (!userId || !metricType || value === undefined) {
            console.error('Lỗi: Thiếu thông tin cần thiết', {
                userId,
                metricType,
                value
            });
            return { success: false, error: 'Thiếu thông tin cần thiết' };
        }

        // URL của Cloud Function
        const functionUrl =
            'https://us-central1-heart-rate-backend.cloudfunctions.net/sendAlertEmailV2';

        // Dữ liệu gửi đi
        const requestData = {
            userId,
            metricType,
            value
        };

        console.log('Gửi yêu cầu đến Cloud Function:', requestData);

        // Goi HTTP POST request
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        // Log response status
        console.log('Status code từ Cloud Function:', response.status);

        // Kiểm tra status code
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(
                `HTTP error! Status: ${response.status}, Response: ${errorText}`
            );
        }

        // Phan tích kết quả
        const result = await response.json();
        console.log('Kết quả từ Cloud Function:', result);

        return result;
    } catch (error) {
        console.error('Lỗi gửi email cảnh báo:', error);
        return { success: false, error: error.message };
    }
};

// Xử lý cảnh báo tổng hợp
export const handleHealthAlert = async (
    userId,
    metricType,
    value,
    threshold,
    soundAlerts
) => {
    console.log('handleHealthAlert được gọi với:', {
        userId,
        metricType,
        value,
        threshold
    });

    try {
        // Tạo thông điệp cảnh báo
        const metricName =
            metricType === 'heartRate'
                ? 'Nhịp tim'
                : metricType === 'spo2'
                ? 'Nồng độ oxy trong máu'
                : 'Đột quỵ';
        const unit = metricType === 'heartRate' ? 'bpm' : '%';
        const title = `Cảnh báo ${metricName}`;

        let alertCondition = '';

        if (metricType === 'heartRate') {
            alertCondition = value < threshold.min ? 'thấp hơn' : 'cao hơn';
        } else if (metricType === 'spo2') {
            // SpO2
            alertCondition = value < threshold.min ? 'thấp hơn' : 'cao hơn';
        }

        let body = '';
        if (metricType === 'heartRate' || metricType === 'spo2') {
            body = `${metricName} của bạn đang ở mức ${value} ${unit}, ${alertCondition} ngưỡng an toàn.`;
        } else {
            body = `Có nguy cơ ${metricName} với xác suất ${(
                value * 100
            ).toFixed(2)}%`;
        }

        console.log('Hiển thị thông báo:', { title, body });

        // Hiển thị thông báo
        await showLocalNotification(title, body);
        await addNotification({
            userId,
            threshold,
            title,
            type: 'health_alert',
            value,
            message: body,
            metricType,
            status: 0
        });
        const promises = [];
        // Phát âm thanh nếu được bật
        if (soundAlerts === 'sound') {
            console.log('Phát âm thanh cảnh báo');
            promises.push(playAlertSound());
        }

        promises.push(sendAlertEmail(userId, metricType, value));

        await Promise.allSettled(promises);
        return true;
    } catch (error) {
        console.error('Lỗi trong handleHealthAlert:', error);
        return false;
    }
};

const previewNotification = async (mode: NotificationMode) => {
    switch (mode) {
        case 'vibration':
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            // Thêm một rung phụ sau 100ms để tạo hiệu ứng rung kép
            setTimeout(async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 100);
            break;
        case 'sound':
            const { sound } = await Audio.Sound.createAsync(
                require('@assets/sounds/notifications.wav')
            );
            await sound.playAsync();
            break;
        default:
            // Silent mode - do nothing
            break;
    }
};
export { isPlayingAlert };
