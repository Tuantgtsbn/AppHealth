import { auth, db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

class SimulatedDeviceService {
  constructor() {
    this.isRunning = false;
    this.interval = null;
    this.intervalTime = 60000; // 1 phút đọc dữ liệu một lần
    this.onNewDataCallback = null;
  }
  
  // Bắt đầu giả lập đọc dữ liệu
  startSimulation(onNewData) {
    if (this.isRunning) return;
    
    this.onNewDataCallback = onNewData;
    this.isRunning = true;
    
    // Đọc dữ liệu ngay lập tức một lần
    this.generateAndSaveReading();
    
    // Thiết lập interval
    this.interval = setInterval(() => {
      this.generateAndSaveReading();
    }, this.intervalTime);
    
    return true;
  }
  
  // Dừng giả lập
  stopSimulation() {
    if (!this.isRunning) return;
    
    clearInterval(this.interval);
    this.interval = null;
    this.isRunning = false;
    
    return true;
  }
  
  // Đọc dữ liệu một lần
  readOnce() {
    return this.generateAndSaveReading();
  }
  
  // Tạo và lưu dữ liệu giả lập
  async generateAndSaveReading() {
    try {
      if (!auth.currentUser) {
        console.log('Người dùng chưa đăng nhập');
        return null;
      }
      
      // Tạo dữ liệu giả lập
      // Nhịp tim thông thường: 60-100 bpm, có thể cao hoặc thấp bất thường
      // SpO2 thông thường: 95-100%, có thể thấp bất thường
      
      // 80% trường hợp dữ liệu nằm trong khoảng bình thường
      const isNormal = Math.random() < 0.8;
      
      let heartRate, spo2;
      
      if (isNormal) {
        // Dữ liệu bình thường
        heartRate = Math.floor(60 + Math.random() * 40); // 60-100
        spo2 = Math.floor(95 + Math.random() * 6); // 95-100
      } else {
        // Dữ liệu bất thường (để gây cảnh báo)
        const isHighHeartRate = Math.random() < 0.5;
        
        if (isHighHeartRate) {
          heartRate = Math.floor(100 + Math.random() * 40); // 100-140
          spo2 = Math.floor(90 + Math.random() * 11); // 90-100
        } else {
          heartRate = Math.floor(40 + Math.random() * 20); // 40-60
          spo2 = Math.floor(85 + Math.random() * 10); // 85-95
        }
      }
      
      // Giới hạn SpO2 không vượt quá 100%
      spo2 = Math.min(spo2, 100);
      
      const readingData = {
        userId: auth.currentUser.uid,
        timestamp: new Date(),
        heartRate: heartRate,
        spo2: spo2,
        deviceInfo: 'Simulated Device'
      };
      
      // Lưu vào Firestore
      const docRef = await addDoc(collection(db, 'healthData'), readingData);
      
      console.log('Đã lưu dữ liệu mới với ID:', docRef.id);
      
      // Gọi callback nếu có
      if (this.onNewDataCallback) {
        this.onNewDataCallback(readingData);
      }
      
      return readingData;
    } catch (error) {
      console.error('Lỗi khi tạo dữ liệu giả lập:', error);
      return null;
    }
  }
}

// Export một instance duy nhất
export default new SimulatedDeviceService();