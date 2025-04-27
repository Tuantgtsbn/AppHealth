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

const HomeScreen = ({ navigation }) => {
  const [userName, setUserName] = useState('');
  const [heartRate, setHeartRate] = useState(null);
  const [spo2, setSpo2] = useState(null);
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
        setHeartRate(latestData.heartRate);
        setSpo2(latestData.spo2);

        const isHRWarning =
          latestData.heartRate < thresholds.heartRate.min || latestData.heartRate > thresholds.heartRate.max;
        const isSPO2Warning = latestData.spo2 < thresholds.spo2.min;

        setIsHeartRateWarning(isHRWarning);
        setIsSpo2Warning(isSPO2Warning);

        if (isHRWarning) {
          handleHealthAlert(userId, 'heartRate', latestData.heartRate, thresholds.heartRate, userSettings);
        }
        if (isSPO2Warning) {
          handleHealthAlert(userId, 'spo2', latestData.spo2, thresholds.spo2, userSettings);
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

            const isHRWarning =
              newHeartRate < thresholds.heartRate.min || newHeartRate > thresholds.heartRate.max;
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

          const isHRWarning =
            newHeartRate < thresholds.heartRate.min || newHeartRate > thresholds.heartRate.max;
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

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setError(null);
            setLoading(true);
            loadUserData();
          }}
        >
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
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
});

export default HomeScreen;