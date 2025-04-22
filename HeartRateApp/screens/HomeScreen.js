import React , {useState , useEffect} from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    ScrollView, 
    TouchableOpacity, 
    RefreshControl,
    ActivityIndicator
  } from 'react-native';
  import { Ionicons } from '@expo/vector-icons';
  import { auth, db } from '../firebase';
  import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
  import HealthMetricCard from '../components/HealthMetricCard';
  import { configureNotifications, handleHealthAlert } from '../services/NotificationService';
  import SimulatedDeviceService from '../services/SimulatedDeviceService';
  
  const HomeScreen = ({ navigation }) => {
    const [userName, setUserName] = useState('');
    const [heartRate, setHeartRate] = useState(null);
    const [spo2, setSpo2] = useState(null);
    const [thresholds, setThresholds] = useState({
      heartRate: { min: 60, max: 100 },
      spo2: { min: 95, max: 100 }
    });
    const [userSettings, setUserSettings] = useState({
      emailNotifications: true,
      soundAlerts: true
    });
    const [isHeartRateWarning, setIsHeartRateWarning] = useState(false);
    const [isSpo2Warning, setIsSpo2Warning] = useState(false);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [simulationActive, setSimulationActive] = useState(false);
  
    useEffect(() => {
      // Cấu hình thông báo khi ứng dụng khởi động
      configureNotifications();
      
      // Tải dữ liệu người dùng
      loadUserData();
    }, []);
  
    const loadUserData = async () => {
      try {
        const userId = auth.currentUser.uid;
        
        // Lấy thông tin cá nhân và cài đặt
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserName(userData.name);
          setThresholds({
            heartRate: userData.heartRateThreshold || { min: 60, max: 100 },
            spo2: userData.spo2Threshold || { min: 95, max: 100 }
          });
          setUserSettings({
            emailNotifications: userData.emailNotifications !== undefined ? userData.emailNotifications : true,
            soundAlerts: userData.soundAlerts !== undefined ? userData.soundAlerts : true
          });
        }
  
        // Lấy dữ liệu nhịp tim và SpO2 mới nhất
        const healthDataQuery = query(
          collection(db, 'healthData'),
          where('userId', '==', userId),
          orderBy('timestamp', 'desc'),
          limit(1)
        );
  
        const healthDataSnapshot = await getDocs(healthDataQuery);
        if (!healthDataSnapshot.empty) {
          const latestData = healthDataSnapshot.docs[0].data();
          
          // Cập nhật dữ liệu
          setHeartRate(latestData.heartRate);
          setSpo2(latestData.spo2);
          
          // Kiểm tra cảnh báo
          const isHRWarning = latestData.heartRate < thresholds.heartRate.min || latestData.heartRate > thresholds.heartRate.max;
          const isSPO2Warning = latestData.spo2 < thresholds.spo2.min;
          
          setIsHeartRateWarning(isHRWarning);
          setIsSpo2Warning(isSPO2Warning);
          
          // Xử lý cảnh báo nếu cần
          if (isHRWarning) {
            handleHealthAlert(userId, 'heartRate', latestData.heartRate, thresholds.heartRate, userSettings);
          }
          
          if (isSPO2Warning) {
            handleHealthAlert(userId, 'spo2', latestData.spo2, thresholds.spo2, userSettings);
          }
        }
      } catch (error) {
        console.log('Lỗi khi tải dữ liệu:', error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };
  
    const onRefresh = () => {
      setRefreshing(true);
      loadUserData();
    };
  
    // Giả lập việc nhận dữ liệu mới (trong ứng dụng thực tế có thể sử dụng Bluetooth hoặc API)
    const simulateNewReading = () => {
      // Giả lập dữ liệu nhịp tim (dao động ngẫu nhiên ±10 từ 75)
      const newHeartRate = Math.floor(70 + Math.random() * 20);
      // Giả lập dữ liệu SpO2 (dao động ngẫu nhiên từ 94-100)
      const newSpo2 = Math.floor(94 + Math.random() * 7);
      
      setHeartRate(newHeartRate);
      setSpo2(newSpo2);
      
      // Kiểm tra ngưỡng cảnh báo
      const isHRWarning = newHeartRate < thresholds.heartRate.min || newHeartRate > thresholds.heartRate.max;
      const isSPO2Warning = newSpo2 < thresholds.spo2.min;
      
      setIsHeartRateWarning(isHRWarning);
      setIsSpo2Warning(isSPO2Warning);
      
      // Xử lý cảnh báo nếu cần
      if (isHRWarning) {
        handleHealthAlert(auth.currentUser.uid, 'heartRate', newHeartRate, thresholds.heartRate, userSettings);
      }
      
      if (isSPO2Warning) {
        handleHealthAlert(auth.currentUser.uid, 'spo2', newSpo2, thresholds.spo2, userSettings);
      }
    };
    
    // Thêm hàm để bắt đầu/dừng giả lập
    const toggleSimulation = () => {
        if (simulationActive) {
            SimulatedDeviceService.stopSimulation();
            setSimulationActive(false);
        } else {
            SimulatedDeviceService.startSimulation((newData) => {
            setHeartRate(newData.heartRate);
            setSpo2(newData.spo2);
            
            // Kiểm tra cảnh báo
            const isHRWarning = newData.heartRate < thresholds.heartRate.min || newData.heartRate > thresholds.heartRate.max;
            const isSPO2Warning = newData.spo2 < thresholds.spo2.min;
            
            setIsHeartRateWarning(isHRWarning);
            setIsSpo2Warning(isSPO2Warning);
            
            // Xử lý cảnh báo nếu cần
            if (isHRWarning) {
                handleHealthAlert(auth.currentUser.uid, 'heartRate', newData.heartRate, thresholds.heartRate, userSettings);
            }
            
            if (isSPO2Warning) {
                handleHealthAlert(auth.currentUser.uid, 'spo2', newData.spo2, thresholds.spo2, userSettings);
            }
        });
        setSimulationActive(true);
        }
    };

    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF4757" />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      );
    }
  
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Xin chào,</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
            <Ionicons name="settings-outline" size={24} color="#333" />
          </TouchableOpacity>
        </View>
  
        <ScrollView 
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#FF4757"]}
            />
          }
        >
          <View style={styles.metricsContainer}>
            <Text style={styles.sectionTitle}>Chỉ số sức khỏe hiện tại</Text>
            
            <HealthMetricCard 
              title="Nhịp tim"
              value={heartRate || '--'}
              unit="bpm"
              icon="heart"
              iconColor="#FF4757"
              isWarning={isHeartRateWarning}
            />
            
            <HealthMetricCard 
              title="Nồng độ Oxy trong máu"
              value={spo2 || '--'}
              unit="%"
              icon="water"
              iconColor="#2E86DE"
              isWarning={isSpo2Warning}
            />
  
            <View style={styles.thresholdInfoContainer}>
              <Text style={styles.thresholdTitle}>Ngưỡng cảnh báo:</Text>
              <Text style={styles.thresholdInfo}>Nhịp tim: {thresholds.heartRate.min} - {thresholds.heartRate.max} bpm</Text>
              <Text style={styles.thresholdInfo}>SpO2: Tối thiểu {thresholds.spo2.min}%</Text>
            </View>
          </View>
  
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Daily')}
            >
              <Ionicons name="calendar-outline" size={24} color="#FF4757" />
              <Text style={styles.actionText}>Biểu đồ theo ngày</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Monthly')}
            >
              <Ionicons name="bar-chart-outline" size={24} color="#FF4757" />
              <Text style={styles.actionText}>Biểu đồ theo tháng</Text>
            </TouchableOpacity>
            
            {/* Thay thế nút "Giả lập đọc dữ liệu mới" bằng 2 nút sau trong phần render */}
            <TouchableOpacity 
              style={[styles.actionButton, styles.simulateButton]}
              onPress={() => SimulatedDeviceService.readOnce()}
            >
              <Ionicons name="pulse-outline" size={24} color="white" />
              <Text style={styles.simulateButtonText}>Đọc dữ liệu một lần</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[
                styles.actionButton, 
                simulationActive ? styles.stopSimulateButton : styles.simulateButton
                ]}
                onPress={toggleSimulation}
            >
                <Ionicons name={simulationActive ? "stop-circle-outline" : "play-circle-outline"}
                size={24}
                color="white" 
                />
                <Text style={styles.simulateButtonText}>
                {simulationActive ? "Dừng theo dõi liên tục" : "Bắt đầu theo dõi liên tục"}
                </Text>
            </TouchableOpacity> 
          </View>
        </ScrollView>
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#F9F9F9',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: '#666',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
      paddingTop: 50,
      backgroundColor: 'white',
      borderBottomWidth: 1,
      borderBottomColor: '#F0F0F0',
    },
    greeting: {
      fontSize: 16,
      color: '#666',
    },
    userName: {
      fontSize: 22,
      fontWeight: 'bold',
      color: '#333',
    },
    scrollView: {
      flex: 1,
    },
    metricsContainer: {
      padding: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333',
    },
    thresholdInfoContainer: {
      marginTop: 10,
      padding: 15,
      backgroundColor: '#F5F5F5',
      borderRadius: 10,
    },
    thresholdTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      marginBottom: 5,
      color: '#333',
    },
    thresholdInfo: {
      fontSize: 14,
      color: '#666',
      marginBottom: 3,
    },
    actionsContainer: {
      padding: 20,
      paddingTop: 0,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'white',
      padding: 15,
      borderRadius: 10,
      marginBottom: 10,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    actionText: {
      marginLeft: 10,
      fontSize: 16,
      color: '#333',
    },
    simulateButton: {
      backgroundColor: '#FF4757',
      marginTop: 10,
    },
    simulateButtonText: {
      marginLeft: 10,
      fontSize: 16,
      color: 'white',
    },
    // Thêm styles mới
    stopSimulateButton: {
        backgroundColor: '#FF3B30',
        marginTop: 10,
    },
  });
  
  export default HomeScreen;