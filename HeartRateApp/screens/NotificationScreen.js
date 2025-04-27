import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { 
    View, 
    Text, 
    StyleSheet, 
    FlatList, 
    TouchableOpacity, 
    SafeAreaView, 
    ActivityIndicator, 
    RefreshControl, 
    StatusBar,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase'; 

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('Alert'); // 'Alert' hoặc 'System'

  const currentUser = auth.currentUser;

  // Làm mới dữ liệu khi màn hình được focus
  useFocusEffect(
    React.useCallback(() => {
      fetchAlertHistory();
      return () => {};
    }, [])
  );

  const fetchAlertHistory = async () => {
    if (!currentUser) {
        console.log('Chưa có người dùng đăng nhập');
        setLoading(false);
        return;
    }

    try {
      setLoading(true);

      const alertHistoryRef = collection(db, 'alertHistory');
      const q = query(
        alertHistoryRef,
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const alertData = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        try {
            alertData.push({
                id: doc.id,
                type: data.metricType === 'heartRate' ? 'Cảnh báo nhịp tim' : 'Cảnh báo SpO2',
                message: getAlertMessage(data),
                date: formatDate(data.timestamp),
                time: formatTime(data.timestamp),
                value: data.value,
                threshold: data.threshold,
                metricType: data.metricType,
                read: false // Bạn có thể muốn thêm trường 'read' vào schema cơ sở dữ liệu
            });
        } catch (error) {
            console.error('Lỗi khi xử lý dữ liệu cảnh báo:', doc.id, error);
        }
      });
      
      setNotifications(alertData);
    } catch (error) {
      console.error('Lỗi khi lấy lịch sử cảnh báo:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull-to-refresh
  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchAlertHistory();
  }, []);

  const getAlertMessage = (data) => {
    const { metricType, value, threshold } = data;
    
    if (metricType === 'heartRate') {
      if (value > threshold.max) {
        return `Nhịp tim của bạn ${value} bpm cao hơn bình thường (tối đa: ${threshold.max} bpm).`;
      } else if (value < threshold.min) {
        return `Nhịp tim của bạn ${value} bpm thấp hơn bình thường (tối thiểu: ${threshold.min} bpm).`;
      }
    } else if (metricType === 'spo2') {
      if (value < threshold.min) {
        return `Nồng độ oxy trong máu của bạn ${value}% thấp hơn bình thường (tối thiểu: ${threshold.min}%).`;
      }
    }
    
    return `Phát hiện ${metricType} bất thường: ${value}`;
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const markAsRead = (id) => {
    // Trong ứng dụng thực tế, bạn sẽ cập nhật cơ sở dữ liệu ở đây
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: true} : notification
    ));
  };

  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => markAsRead(item.id)}
    >
      <View style={styles.notificationIconContainer}>
        {item.metricType === 'heartRate' ? (
          <Ionicons name="heart" size={24} color="#FF4757" />
        ) : (
          <Ionicons name="water" size={24} color="#2E86DE" />
        )}
      </View>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationType}>{item.type}</Text>
        <Text style={styles.notificationDate}>{item.date} {item.time}</Text>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <TouchableOpacity 
          style={styles.detailButton}
          onPress={() => navigation.navigate('DetailNotification', {
            notificationId: item.id,
            notificationType: item.type,
            notificationValue: item.value,
            threshold: item.threshold
          })}
        >
          <Text style={styles.detailButtonText}>Xem thêm...</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="notifications-off-outline" size={60} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f5f5f5" barStyle="dark-content" /> 

      {/* Thêm View để tạo khoảng cách với thanh trạng thái */}
      <View style={styles.statusBarSpacer} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={styles.headerRight}>
           {/* Nút làm mới */}
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchAlertHistory}
            disabled={loading}
          >
            <Ionicons name="refresh" size={24} color="#FF4757" />
          </TouchableOpacity>

            <View style={styles.headerTabs}>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'Alert' && styles.activeTabButton]}
                onPress={() => setActiveTab('Alert')}
              >
                <Text style={[styles.tabText, activeTab === 'Alert' && styles.activeTabText]}>Cảnh báo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tabButton, activeTab === 'System' && styles.activeTabButton]}
                onPress={() => setActiveTab('System')}
              >
                <Text style={[styles.tabText, activeTab === 'System' && styles.activeTabText]}>Hệ thống</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4757" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications.filter(n => 
            activeTab === 'Alert' ? 
              (n.metricType === 'heartRate' || n.metricType === 'spo2') : 
              false // Hiện tại, không có thông báo hệ thống
          )}
          renderItem={renderNotificationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.notificationList}
          ListEmptyComponent={renderEmptyList}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh}
              colors={['#FF4757']}
            />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerTabs: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    marginRight: 8,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 5,
  },
  activeTabButton: {
    backgroundColor: '#FF4757',
  },
  tabText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  notificationList: {
    padding: 16,
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  unreadNotification: {
    backgroundColor: '#F0F0F0',
  },
  notificationIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  notificationDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 8,
  },
  detailButton: {
    alignSelf: 'flex-end',
  },
  detailButtonText: {
    color: '#2E86DE',
    fontSize: 12,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  }
});

export default NotificationScreen;
