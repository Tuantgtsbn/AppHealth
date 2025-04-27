import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
// import { httpsCallable } from 'firebase/functions';
// import { functions } from '../firebase';
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
export const sendAlertEmail = async (userId, metricType, value) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    if (!userId || !metricType || value === undefined) {
      console.error('Lỗi: Thiếu thông tin cần thiết', { userId, metricType, value });
      return { success: false, error: 'Thiếu thông tin cần thiết' };
    }

    // URL của Cloud Function
    const functionUrl = 'https://us-central1-heart-rate-backend.cloudfunctions.net/sendAlertEmail';
    
    // Dữ liệu gửi đi
    const requestData = {
      userId,
      metricType,
      value,
    };

    console.log('Gửi yêu cầu đến Cloud Function:', requestData);

    // Goi HTTP POST request
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // Log response status
    console.log('Status code từ Cloud Function:', response.status);

    // Kiểm tra status code
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, Response: ${errorText}`);
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
export const handleHealthAlert = async (userId, metricType, value, threshold, userSettings) => {
  console.log('handleHealthAlert được gọi với:', { userId, metricType, value, threshold, userSettings });
  
  try {
    // Tạo thông điệp cảnh báo
    const metricName = metricType === 'heartRate' ? 'Nhịp tim' : 'SpO2';
    const unit = metricType === 'heartRate' ? 'bpm' : '%';
    const title = `Cảnh báo ${metricName}`;
    
    let alertCondition = '';
    
    if (metricType === 'heartRate') {
      alertCondition = value < threshold.min ? 'thấp hơn' : 'cao hơn';
    } else { // SpO2
      alertCondition = value < threshold.min ? 'thấp hơn' : 'cao hơn';
    }
    
    const body = `${metricName} của bạn đang ở mức ${value} ${unit}, ${alertCondition} ngưỡng an toàn.`;
    
    console.log('Hiển thị thông báo:', { title, body });
    
    // Hiển thị thông báo
    await showLocalNotification(title, body);
    
    // Phát âm thanh nếu được bật
    if (userSettings.soundAlerts) {
      console.log('Phát âm thanh cảnh báo');
      await playAlertSound();
    }
    
    // Gửi email nếu được bật
    if (userSettings.emailNotifications) {
      console.log('Gửi email cảnh báo với userId:', userId);
      await sendAlertEmail(userId, metricType, value);
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi trong handleHealthAlert:', error);
    return false;
  }
};