import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Platform,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const DetailNotificationScreen = ({ route, navigation }) => {
  const { notificationId, notificationType, notificationValue, threshold } = route.params;
  const [loading, setLoading] = useState(true);
  const [notificationDetail, setNotificationDetail] = useState(null);

  useEffect(() => {
    fetchNotificationDetail();
  }, []);

  const fetchNotificationDetail = async () => {
    try {
      // Nếu cần, bạn có thể lấy thêm thông tin từ Firestore
      const notificationRef = doc(db, 'alertHistory', notificationId);
      const notificationDoc = await getDoc(notificationRef);
      
      if (notificationDoc.exists()) {
        setNotificationDetail(notificationDoc.data());
      } else {
        console.log('Không tìm thấy chi tiết thông báo');
      }

      setLoading(false);
    } catch (error) {
      console.error('Lỗi khi lấy chi tiết thông báo:', error);
      setLoading(false);
    }
  };

  // Tạo lời khuyên y học dựa trên loại thông báo và giá trị
  const getMedicalAdvice = () => {
    const isHeartRate = notificationType.includes('nhịp tim');
    const value = notificationValue;
    
    if (isHeartRate) {
      if (value > (threshold?.max || 100)) {
        return [
          'Nghỉ ngơi và thư giãn trong vài phút',
          'Thực hiện hít thở sâu và chậm',
          'Uống một cốc nước',
          'Tránh caffeine và đồ uống có cồn',
          'Nếu nhịp tim vẫn cao hoặc kèm theo triệu chứng khác như đau ngực, khó thở, chóng mặt, hãy liên hệ bác sĩ ngay lập tức'
        ];
      } else if (value < (threshold?.min || 60)) {
        return [
          'Ngồi hoặc nằm xuống nếu cảm thấy chóng mặt',
          'Uống nước để tránh mất nước',
          'Kiểm tra nếu bạn đang dùng thuốc có thể ảnh hưởng đến nhịp tim',
          'Tránh thay đổi tư thế đột ngột',
          'Nếu nhịp tim thấp kèm theo triệu chứng như chóng mặt, mệt mỏi, ngất xỉu, hãy liên hệ bác sĩ ngay lập tức'
        ];
      }
    } else {
      // Lời khuyên cho SpO2 thấp
      return [
        'Ngồi thẳng lưng hoặc đứng dậy để tăng dung tích phổi',
        'Thực hiện các bài tập hít thở sâu',
        'Đảm bảo môi trường có đủ không khí trong lành',
        'Tránh môi trường ô nhiễm hoặc có khói',
        'Nếu mức SpO2 tiếp tục dưới 92% hoặc bạn gặp khó thở, hãy liên hệ bác sĩ ngay lập tức',
        'Đối với người mắc các bệnh về phổi hoặc tim, hãy tuân theo hướng dẫn y tế đặc biệt của bác sĩ'
      ];
    }
  };

  const renderAdviceItems = (advices) => {
    return advices.map((advice, index) => (
      <View key={index} style={styles.adviceItem}>
        <View style={styles.bulletPoint}>
          <Text style={styles.bulletPointText}>{index + 1}</Text>
        </View>
        <Text style={styles.adviceText}>{advice}</Text>
      </View>
    ));
  };

  const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

  return (
    <View style={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết cảnh báo</Text>
        <View style={styles.headerRight} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4757" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          <View style={styles.alertCard}>
            <View style={styles.iconContainer}>
              {notificationType.includes('nhịp tim') ? (
                <Ionicons name="heart" size={50} color="#FF4757" />
              ) : (
                <Ionicons name="water" size={50} color="#2E86DE" />
              )}
            </View>
            
            <Text style={styles.alertTitle}>{notificationType}</Text>
            
            <View style={styles.valueContainer}>
              <Text style={styles.valueText}>
                {notificationType.includes('nhịp tim') 
                  ? `${notificationValue} bpm` 
                  : `${notificationValue}%`}
              </Text>
              <Text style={styles.thresholdText}>
                {notificationType.includes('nhịp tim') 
                  ? (notificationValue > (threshold?.max || 100) 
                     ? `Cao hơn ngưỡng bình thường (${threshold?.max || 100} bpm)` 
                     : `Thấp hơn ngưỡng bình thường (${threshold?.min || 60} bpm)`)
                  : `Thấp hơn ngưỡng bình thường (${threshold?.min || 95}%)`}
              </Text>
              
              {notificationDetail && (
                <Text style={styles.timestampText}>
                  Thời gian: {new Date(notificationDetail.timestamp.toDate()).toLocaleString('vi-VN')}
                </Text>
              )}
            </View>
          </View>

          <View style={styles.adviceSection}>
            <Text style={styles.adviceSectionTitle}>
              {notificationType.includes('nhịp tim') 
                ? `Lời khuyên cho ${notificationValue > (threshold?.max || 100) ? 'nhịp tim cao' : 'nhịp tim thấp'}`
                : 'Lời khuyên cho nồng độ oxy thấp'}
            </Text>
            <View style={styles.adviceList}>
              {renderAdviceItems(getMedicalAdvice())}
            </View>
            
            <View style={styles.disclaimer}>
              <Ionicons name="information-circle" size={20} color="#FF4757" />
              <Text style={styles.disclaimerText}>
                Lưu ý: Những lời khuyên này chỉ mang tính chất tham khảo. Vui lòng tham khảo ý kiến bác sĩ nếu tình trạng sức khỏe nghiêm trọng.
              </Text>
            </View>
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
//   statusBarSpacer: {
//     height: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
//     backgroundColor: '#f5f5f5',
//   },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    elevation: 33,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    width: 40, // Để cân bằng với nút back ở bên trái
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  alertCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  valueContainer: {
    alignItems: 'center',
    width: '100%',
  },
  valueText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FF4757',
    marginBottom: 8,
  },
  thresholdText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  timestampText: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
  adviceSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adviceSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  adviceList: {
    marginBottom: 16,
  },
  adviceItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  bulletPoint: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FF4757',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  bulletPointText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  adviceText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
  disclaimer: {
    flexDirection: 'row',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'flex-start',
  },
  disclaimerText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});

export default DetailNotificationScreen;