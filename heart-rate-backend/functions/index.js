const functions = require("firebase-functions");
const admin = require("firebase-admin");
const serviceAccount = require(
    "./config/heart-rate-backend-firebase-adminsdk-fbsvc-21ba5082be.json");
const nodemailer = require("nodemailer");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Cấu hình mail transporter (Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nguyenmaily140703@gmail.com", // Thay bằng email thật + App password
    pass: "wknt wdkz npfj solo",
    // App Password, không dùng mật khẩu Gmail thường
  },
});

// Dùng onRequest thay vì onCall để tương thích với Cloud Functions Gen 2
exports.sendAlertEmail = functions.https.onRequest(async (req, res) => {
  try {
    // Lấy dữ liệu từ body (POST)
    const {userId, metricType, value} = req.body;
    console.log("Receieved data:", {userId, metricType, value});

    if (!userId || !metricType || value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Thiếu dữ liệu đầu vào"});
    }

    // Truy vấn thông tin người dùng từ Firestore
    const userDoc = await admin.firestore().
        collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng"});
    }

    const userData = userDoc.data();
    const userName = userData.name || "Người dùng";
    const userEmail = userData.email;
    const emergencyContact = userData.emergencyContact;

    // Lấy ngưỡng cảnh báo từ Firestore - user
    let threshold;
    if (metricType === "heartRate") {
      threshold = userData.heartRateThreshold || {min: 60, max: 100};
    } else if (metricType == "spo2") {
      threshold = userData.spo2Threshold || {min: 95, max: 100};
    } else {
      return res.status(400).json({
        success: false,
        message: "metricType không hợp lệ (phải là 'heartRate' hoặc 'spO2')"});
    }

    console.log("Using threshold:", threshold);

    const metricName = metricType === "heartRate" ? "Nhịp tim" : "SpO2";
    const metricUnit = metricType === "heartRate" ? "bpm" : "%";
    const condition = metricType === "heartRate"?
        (value > threshold.max ? "cao" : "thấp"):
        (value < threshold.min ? "thấp" : "cao");

    const emailSubject = `[HeartRateApp] Cảnh báo ${metricName}`;
    const emailContent = `
      <h2>Cảnh báo từ HeartRateApp</h2>
      <p>Kính gửi ${userName},</p>
      <p>Hệ thống đã phát hiện chỉ số sức khỏe 
      không nằm trong ngưỡng an toàn:</p>
      <div 
      style="padding: 15px;
      background-color: #FFF5F5;
      border-left: 4px solid #FF4757;
      margin: 20px 0;">
        <p><strong>
        ${metricName} của bạn đang ở mức ${value} ${metricUnit}
        </strong></p>
        <p>Đây là mức ${condition} hơn ngưỡng an toàn
        (${metricType === "heartRate"?
            `${threshold.min}-${threshold.max} ${metricUnit}`:
            `tối thiểu ${threshold.min} ${metricUnit}`}).</p>
      </div>
      <p>Vui lòng kiểm tra lại hoặc liên hệ với 
      chuyên gia y tế nếu tình trạng kéo dài.</p>
      <p>Trân trọng,<br>Đội ngũ HeartRateApp</p>
    `;

    const mailOptions = {
      from: "\"HeartRateApp\" <nguyenmaily140703@gmail.com>",
      to: userEmail,
      subject: emailSubject,
      html: emailContent,
    };

    if (emergencyContact && emergencyContact.trim() !== "") {
      mailOptions.cc = emergencyContact;
    }

    await transporter.sendMail(mailOptions);

    // Lưu lịch sử cảnh báo
    await admin.firestore().collection("alertHistory").add({
      userId,
      metricType,
      value,
      threshold, // Lưu threshold đã sử dụng
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      emailSent: true,
    });

    return res.status(200).json({
      success: true,
      message: "Email cảnh báo đã được gửi"});
  } catch (error) {
    console.error("Lỗi khi gửi email cảnh báo:", error);
    return res.status(500).json({success: false, message: error.message});
  }
});
