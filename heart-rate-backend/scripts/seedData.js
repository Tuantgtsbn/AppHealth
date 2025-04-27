const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Tạo file này từ Firebase Console

// Khởi tạo Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Thời gian hiện tại
const now = new Date();

// Tạo dữ liệu cho 7 ngày trước
async function seedData() {
  try {
    // Lấy user ID mẫu - thay thế bằng user ID của bạn
    const userId = 'your-user-id';
    
    for (let i = 0; i < 7; i++) {
      // Ngày i ngày trước
      const date = new Date();
      date.setDate(now.getDate() - i);
      
      // Tạo 6 điểm dữ liệu mỗi ngày (cứ 4 giờ một lần)
      for (let hour = 0; hour < 24; hour += 4) {
        const timestamp = new Date(date);
        timestamp.setHours(hour, 0, 0, 0);
        
        // Tạo dữ liệu nhịp tim và SpO2 ngẫu nhiên
        const heartRate = Math.floor(60 + Math.random() * 40); // 60-100
        const spo2 = Math.floor(95 + Math.random() * 6); // 95-100
        
        // Thêm vào Firestore
        await db.collection('healthData').add({
          userId: userId,
          timestamp: admin.firestore.Timestamp.fromDate(timestamp),
          heartRate: heartRate,
          spo2: spo2,
          deviceInfo: 'Seed Data'
        });
        
        console.log(`Đã thêm dữ liệu cho ngày ${timestamp.toLocaleDateString()} giờ ${timestamp.getHours()}:00`);
      }
    }
    
    console.log('Hoàn thành thêm dữ liệu!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi khi thêm dữ liệu:', error);
    process.exit(1);
  }
}

seedData();