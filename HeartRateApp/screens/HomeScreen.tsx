import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../firebase';
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs, setDoc } from 'firebase/firestore';
import HealthMetricCard from '../components/HealthMetricCard';
import { configureNotifications, handleHealthAlert } from '../services/NotificationService';
import BluetoothService from '../services/BluetoothService';
import * as tf from '@tensorflow/tfjs';
import loadModel from '../services/loadModel';
import makePrediction from '../services/makePrediction';

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [heartRate, setHeartRate] = useState(null);
  const [spo2, setSpo2] = useState(null);
  const [strokeRisk, setStrokeRisk] = useState(null); // State để lưu kết quả dự đoán đột quỵ
  const [model, setModel] = useState(null); // State để lưu mô hình TensorFlow.js
  const [modelLoading, setModelLoading] = useState(true); // State để theo dõi trạng thái tải mô hình
  const [modelError, setModelError] = useState(null); // State để lưu lỗi khi tải mô hình
  const [thresholds, setThresholds] = useState({
    heartRate: { min: 60, max: 100 },
    spo2: { min: 95, max: 100 },
  });
  const [userSettings, setUserSettings] = useState({
    emailNotifications: true,
    soundAlerts: true,
  });
  const [isHeartRateWarning, setIsHeartRateWarning] = useState(false);
  const [isSpo2Warning, setIsSpo2Warning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connectedDeviceName, setConnectedDeviceName] = useState('');
  const [error, setError] = useState(null);
  const [subscription, setSubscription] = useState(null);

  const bluetoothService = new BluetoothService();

  // Dữ liệu đầu vào mẫu cho mô hình
  const [userInput, setUserInput] = useState({
    Age: 27,
    Gender: 'Male',
    Region: 'East',
    'Urban/Rural': 'Urban',
    SES: 'Middle',
    'Smoking Status': 'Occasionally',
    'Alcohol Consumption': 'Never',
    'Diet Type': 'Vegetarian',
    'Physical Activity Level': 'Sedentary',
    'Screen Time (hrs/day)': 6,
    'Sleep Duration (hrs/day)': 7,
    'Family History of Heart Disease': 'No',
    Diabetes: 'No',
    Hypertension: 'No',
    'Cholesterol Levels': 137,
    BMI: 19,
    'Stress Level': 'Medium',
    'Blood Pressure': '177.1/90.0',
    'Resting Heart Rate': 90,
    'ECG Results': 'Normal',
    'Chest Pain Type': 'Non-anginal',
    'Maximum Heart Rate Achieved': 188,
    'Exercise Induced Angina': 'No',
    'Blood Oxygen Levels (SpO2%)': 80,
    'Triglyceride Levels (mg/dL)': 102,
  });

  // Tải mô hình TensorFlow.js khi component được mount
  useEffect(() => {
    const fetchModel = async () => {
      try {
        setModelLoading(true);
        await tf.setBackend('cpu');
        await tf.ready();
        const loadedModel = await loadModel();
        setModel(loadedModel);
        setModelError(null);
      } catch (err) {
        console.log('Không thể tải mô hình:', err);
        setModelError('Không thể tải mô hình dự đoán. Vui lòng thử lại sau.');
      } finally {
        setModelLoading(false);
      }
    };

    fetchModel();
  }, []);

  // Chạy dự đoán khi có dữ liệu từ Firebase hoặc Bluetooth
  useEffect(() => {
    if (model && (heartRate !== null || spo2 !== null)) {
      const updatedInput = {
        ...userInput,
        'Resting Heart Rate': heartRate !== null ? heartRate : userInput['Resting Heart Rate'],
        'Blood Oxygen Levels (SpO2%)': spo2 !== null ? spo2 : userInput['Blood Oxygen Levels (SpO2%)'],
      };
      setUserInput(updatedInput);

      // Chạy dự đoán
      const prediction = makePrediction(model, updatedInput);
      prediction.then((result) => {
        console.log('Prediction result:', result);
        console.log('Type of result:', typeof result);
        // Ép kiểu result thành số nếu nó là chuỗi
        const numericResult = typeof result === 'string' ? parseFloat(result) : result;
        setStrokeRisk(numericResult);
      }).catch((err) => {
        console.log('Lỗi khi dự đoán:', err);
        setStrokeRisk(null);
      });
    }
  }, [model, heartRate, spo2]);

  useEffect(() => {
    if (!auth || !db) {
      setError('Firebase initialization failed. Please check your configuration.');
      setLoading(false);
      return;
    }

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        configureNotifications();
        loadUserData();
      } else {
        setError('User not authenticated. Please log in.');
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadUserData = async () => {
    try {
      const userId = auth.currentUser.uid;

      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserName(userData.name);
        setThresholds({
          heartRate: userData.heartRateThreshold || { min: 60, max: 100 },
          spo2: userData.spo2Threshold || { min: 95, max: 100 },
        });
        setUserSettings({
          emailNotifications: userData.emailNotifications !== undefined ? userData.emailNotifications : true,
          soundAlerts: userData.soundAlerts !== undefined ? userData.soundAlerts : true,
        });
      }

      const healthDataQuery = query(
        collection(db, 'healthData'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(1)
      );

      const healthDataSnapshot = await getDocs(healthDataQuery);
      if (!healthDataSnapshot.empty) {
        const latestData = healthDataSnapshot.docs[0].data();
        const newHeartRate = latestData.heartRate;
        const newSpo2 = latestData.spo2;

        setHeartRate(newHeartRate);
        setSpo2(newSpo2);

        const isHRWarning = newHeartRate < thresholds.heartRate.min || newHeartRate > thresholds.heartRate.max;
        const isSPO2Warning = newSpo2 < thresholds.spo2.min;

        setIsHeartRateWarning(isHRWarning);
        setIsSpo2Warning(isSPO2Warning);

        if (isHRWarning) {
          handleHealthAlert(userId, 'heartRate', newHeartRate, thresholds.heartRate, userSettings);
        }
        if (isSPO2Warning) {
          handleHealthAlert(userId, 'spo2', newSpo2, thresholds.spo2, userSettings);
        }
      }
    } catch (error) {
      console.log('Lỗi khi tải dữ liệu:', error);
      setError('Failed to load user data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadUserData();
  };

  const startScanning = async () => {
    setScanning(true);
    setDevices([]);
    await bluetoothService.scanDevices((updatedDevices) => {
      setDevices(updatedDevices);
    });
    setScanning(false);
  };

  const stopScanning = () => {
    bluetoothService.stopScan();
    setScanning(false);
  };

  const connectToDevice = async (deviceId) => {
    stopScanning();
    const device = devices.find((d) => d.id === deviceId);
    try {
      const success = await bluetoothService.connectToDevice(deviceId);
      if (success) {
        setConnected(true);
        setConnectedDeviceName(device.name || 'Unknown Device');
        console.log('Starting to monitor data for device:', deviceId);
        await startMonitoringData();
      } else {
        setError('Failed to connect to device. Please try again.');
        setConnected(false);
      }
    } catch (error) {
      console.error('Connect to device error:', error);
      setError('Failed to connect to device: ' + error.message);
      setConnected(false);
    }
  };

  const startMonitoringData = async () => {
    const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
    const characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

    try {
      const sub = bluetoothService.monitorData(serviceUUID, characteristicUUID, async (data) => {
        if (data) {
          const match = data.match(/SpO2:(\d+),HR:(\d+)/);
          if (match) {
            const [_, spo2Value, hrValue] = match;
            const newHeartRate = parseInt(hrValue);
            const newSpo2 = parseInt(spo2Value);

            setHeartRate(newHeartRate);
            setSpo2(newSpo2);

            const isHRWarning = newHeartRate < thresholds.heartRate.min || newHeartRate > thresholds.heartRate.max;
            const isSPO2Warning = newSpo2 < thresholds.spo2.min;

            setIsHeartRateWarning(isHRWarning);
            setIsSpo2Warning(isSPO2Warning);

            if (isHRWarning) {
              handleHealthAlert(auth.currentUser.uid, 'heartRate', newHeartRate, thresholds.heartRate, userSettings);
            }
            if (isSPO2Warning) {
              handleHealthAlert(auth.currentUser.uid, 'spo2', newSpo2, thresholds.spo2, userSettings);
            }

            const userId = auth.currentUser.uid;
            const healthDataRef = doc(collection(db, 'healthData'));
            await setDoc(healthDataRef, {
              userId,
              heartRate: newHeartRate,
              spo2: newSpo2,
              timestamp: new Date().toISOString(),
            });
          }
        }
      });
      if (sub) {
        setSubscription(sub);
        console.log('Monitoring started successfully');
      } else {
        console.error('Failed to start monitoring: Subscription is null');
        setError('Failed to start monitoring data. Please reconnect.');
      }
    } catch (error) {
      console.error('Start monitoring error:', error);
      setError('Failed to start monitoring: ' + error.message);
    }
  };

  const disconnect = async () => {
    try {
      if (subscription) {
        subscription.remove();
        setSubscription(null);
        await new Promise((resolve) => setTimeout(resolve, 500));
        console.log('Subscription removed');
      }
      await bluetoothService.disconnect();
      console.log('Disconnect called successfully');
    } catch (error) {
      console.error('Disconnect error in HomeScreen:', error);
      setError('Failed to disconnect: ' + error.message);
    } finally {
      setConnected(false);
      setConnectedDeviceName('');
      setDevices([]);
      setScanning(false);
    }
  };

  const readOnce = async () => {
    const serviceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
    const characteristicUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
    try {
      const data = await bluetoothService.readData(serviceUUID, characteristicUUID);
      if (data) {
        const match = data.match(/SpO2:(\d+),HR:(\d+)/);
        if (match) {
          const [_, spo2Value, hrValue] = match;
          const newHeartRate = parseInt(hrValue);
          const newSpo2 = parseInt(spo2Value);

          setHeartRate(newHeartRate);
          setSpo2(newSpo2);

          const isHRWarning = newHeartRate < thresholds.heartRate.min || newHeartRate > thresholds.heartRate.max;
          const isSPO2Warning = newSpo2 < thresholds.spo2.min;

          setIsHeartRateWarning(isHRWarning);
          setIsSpo2Warning(isSPO2Warning);

          if (isHRWarning) {
            handleHealthAlert(auth.currentUser.uid, 'heartRate', newHeartRate, thresholds.heartRate, userSettings);
          }
          if (isSPO2Warning) {
            handleHealthAlert(auth.currentUser.uid, 'spo2', newSpo2, thresholds.spo2, userSettings);
          }

          const userId = auth.currentUser.uid;
          const healthDataRef = doc(collection(db, 'healthData'));
          await setDoc(healthDataRef, {
            userId,
            heartRate: newHeartRate,
            spo2: newSpo2,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        setError('No data received from device.');
      }
    } catch (error) {
      console.error('Read data error:', error);
      setError('Failed to read data: ' + error.message);
    }
  };

  const renderDeviceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => connectToDevice(item.id)}
      disabled={connected}
    >
      <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
      <Text style={styles.deviceId}>{item.id}</Text>
    </TouchableOpacity>
  );

  const renderStrokeRisk = () => {
    if (modelLoading) {
      return <Text style={styles.strokeRiskText}>Đang tải mô hình...</Text>;
    }
    if (modelError) {
      return <Text style={styles.strokeRiskText}>Lỗi tải mô hình</Text>;
    }
    if (strokeRisk === null || isNaN(strokeRisk)) {
      return <Text style={styles.strokeRiskText}>Chưa có dữ liệu</Text>;
    }

    const isHighRisk = strokeRisk > 0.25;
    return (
      <View>
        <Text style={styles.strokeRiskText}>Kết quả dự đoán: {strokeRisk}</Text>
        <Text style={styles.riskLabel}>
          Nguy cơ:{' '}
          <Text style={[styles.riskValue, { color: isHighRisk ? '#FF0000' : '#00FF00' }]}>
            {isHighRisk ? 'cao' : 'thấp'}
          </Text>
        </Text>
      </View>
    );
  };

  const renderHeader = () => (
    <>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.userName}>{userName}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

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

        {/* Hiển thị nguy cơ đột quỵ */}
        <HealthMetricCard
          title="Nguy cơ đột quỵ"
          value={renderStrokeRisk()}
          unit=""
          icon="warning"
          iconColor="#FF9500"
          isWarning={strokeRisk !== null && !isNaN(strokeRisk) && strokeRisk > 0.25}
        />

        <View style={styles.thresholdInfoContainer}>
          <Text style={styles.thresholdTitle}>Ngưỡng cảnh báo:</Text>
          <Text style={styles.thresholdInfo}>
            Nhịp tim: {thresholds.heartRate.min} - {thresholds.heartRate.max} bpm
          </Text>
          <Text style={styles.thresholdInfo}>SpO2: Tối thiểu {thresholds.spo2.min}%</Text>
        </View>

        {/* Phần quét thiết bị */}
        {connected ? (
          <>
            <Text style={styles.connectedDeviceText}>
              Đã kết nối với: {connectedDeviceName}
            </Text>
            <TouchableOpacity style={[styles.actionButton, styles.simulateButton]} onPress={readOnce}>
              <Ionicons name="pulse-outline" size={24} color="white" />
              <Text style={styles.simulateButtonText}>Đọc dữ liệu một lần</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.stopSimulateButton]}
              onPress={disconnect}
            >
              <Ionicons name="stop-circle-outline" size={24} color="white" />
              <Text style={styles.simulateButtonText}>Ngắt kết nối</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {scanning ? (
              <>
                <ActivityIndicator size="small" color="#FF4757" />
                <Text style={styles.scanningText}>Đang quét thiết bị...</Text>
                <TouchableOpacity style={[styles.actionButton, styles.stopSimulateButton]} onPress={stopScanning}>
                  <Ionicons name="stop-circle-outline" size={24} color="white" />
                  <Text style={styles.simulateButtonText}>Dừng quét</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={[styles.actionButton, styles.simulateButton]} onPress={startScanning}>
                <Ionicons name="bluetooth" size={24} color="white" />
                <Text style={styles.simulateButtonText}>Quét thiết bị</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Danh sách thiết bị ngay dưới phần quét */}
        {devices.length > 0 && !connected && (
          <View style={styles.deviceList}>
            <FlatList
              data={devices}
              renderItem={renderDeviceItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
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
      </View>
    </>
  );

  if (error || modelError) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error || modelError}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setModelError(null);
            setLoading(true);
            setModelLoading(true);
            loadUserData();
            const fetchModel = async () => {
              try {
                await tf.setBackend('cpu');
                await tf.ready();
                const loadedModel = await loadModel();
                setModel(loadedModel);
                setModelError(null);
              } catch (err) {
                console.log('Không thể tải mô hình:', err);
                setModelError('Không thể tải mô hình dự đoán. Vui lòng thử lại sau.');
              } finally {
                setModelLoading(false);
              }
            };
            fetchModel();
          }}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading || modelLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF4757" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      ListHeaderComponent={renderHeader}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FF4757']} />
      }
      contentContainerStyle={styles.container}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9F9F9',
    paddingBottom: 20,
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
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF4757',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
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
    marginBottom: 15,
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
  stopSimulateButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  simulateButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: 'white',
  },
  scanningText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  connectedDeviceText: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    marginVertical: 10,
  },
  deviceList: {
    marginTop: 10,
    marginBottom: 20,
  },
  deviceItem: {
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginVertical: 5,
    backgroundColor: '#fff',
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
  },
  strokeRiskText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },
  riskLabel: {
    fontSize: 18,
    color: '#333',
    fontWeight: 'bold',
  },
  riskValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default HomeScreen;