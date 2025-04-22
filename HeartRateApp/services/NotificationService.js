import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase';
import { Audio } from 'expo-av';

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
      shouldSetBadge: true,
    }),
  });

  return true;
};

// Hiển thị thông báo trên thiết bị
export const showLocalNotification = async (title, body) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: null, // Hiển thị ngay lập tức
    });
    return true;
  } catch (error) {
    console.error('Lỗi hiển thị thông báo:', error);
    return false;
  }
};

// Phát âm thanh cảnh báo
export const playAlertSound = async () => {
  // Sử dụng react-native-sound để phát âm thanh
  try{
    const {sound} = await Audio.Sound.createAsync(
        require('../assets/sounds/alert.mp3'),
    );
    await sound.playAsync();

    // Giải phóng âm thanh sau khi phát xong
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync();
      }
    });

    return true;
  } catch (error) {
    console.error('Lỗi phát âm thanh cảnh báo:', error);
    return false;
  }
  
};

// Gửi email cảnh báo
export const sendAlertEmail = async (userId, metricType, value, threshold) => {
  try {
    // Gọi Cloud Function để gửi email
    const sendEmail = httpsCallable(functions, 'sendAlertEmail');
    const result = await sendEmail({
      userId,
      metricType,
      value,
      threshold
    });
    
    return result.data;
  } catch (error) {
    console.error('Lỗi gửi email cảnh báo:', error);
    return { success: false, error: error.message };
  }
};

// Xử lý cảnh báo tổng hợp
export const handleHealthAlert = async (userId, metricType, value, threshold, userSettings) => {
  // Tạo thông điệp cảnh báo
  const metricName = metricType === 'heartRate' ? 'Nhịp tim' : 'SpO2';
  const title = `Cảnh báo ${metricName}`;
  const body = `${metricName} của bạn đang ở mức ${value} ${metricType === 'heartRate' ? 'bpm' : '%'}, ${value > threshold.max ? 'cao hơn' : 'thấp hơn'} ngưỡng an toàn.`;
  
  // Hiển thị thông báo
  await showLocalNotification(title, body);
  
  // Phát âm thanh nếu được bật
  if (userSettings.soundAlerts) {
    playAlertSound();
  }
  
  // Gửi email nếu được bật
  if (userSettings.emailNotifications) {
    await sendAlertEmail(userId, metricType, value, threshold);
  }
};