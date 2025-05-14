import AsyncStorage from '@react-native-async-storage/async-storage';

export type NotificationMode = 'silent' | 'vibration' | 'sound';

const NOTIFICATION_MODE_KEY = '@notification_mode';

export const getNotificationMode = async (): Promise<NotificationMode> => {
    try {
        const mode = await AsyncStorage.getItem(NOTIFICATION_MODE_KEY);
        return (mode as NotificationMode) || 'silent';
    } catch (error) {
        console.error('Error getting notification mode:', error);
        throw new Error('Lỗi khi lấy chế độ thông báo');
    }
};

export const setNotificationMode = async (
    mode: NotificationMode
): Promise<void> => {
    try {
        await AsyncStorage.setItem(NOTIFICATION_MODE_KEY, mode);
    } catch (error) {
        console.error('Error setting notification mode:', error);
        throw new Error('Không thể cập nhật chế độ thông báo');
    }
};
