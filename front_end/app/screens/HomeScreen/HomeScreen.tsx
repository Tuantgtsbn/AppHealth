import { RootState } from '@/redux/store';
import { getUserProfile } from '@/redux/userSlice';
import { auth } from '@config/firebase';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState, useRef, useCallback } from 'react';

import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Alert,
    Modal,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import {
    disconnectedDevice,
    setConnectedDevice
} from '@/redux/connectDeviceSlice';
import Card from '@/components/ui/Card';
import RealTimeChart from './components/RealTimeChart';
import { useNetwork } from '@/context/NetWorkContext';
import SectionHealthInfo from './components/SectionHealthInfo';
import {
    createDataFromSensor,
    fakeDataFromSensor,
    sendDataSensorIntoFirestore
} from '@services/sensor.service';
import DataSensor from '../../../types/dataSensor.types';
import {
    configureNotifications,
    stopAlertSound
} from '@services/notification.service';
import { BluetoothService } from '../../../services/BluetoothService';
import { Device } from 'react-native-ble-plx';
import { addDevice, fetchUserDevices } from '@/redux/deviceSlice';
import { useFocusEffect } from '@react-navigation/native';
// UUID của service và characteristic
const SENSOR_SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const SENSOR_CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';
type DeviceBluetooth = Device & {
    nameDisplay: string;
    hasBeenConnected: boolean;
};
const HomeScreen = ({ navigation }) => {
    const [isPlayingAlert, setIsPlayingAlert] = useState(false);
    const {
        isConnected: isNetWorkConnected,
        checkConnection,
        pendingSyncCount,
        syncOfflineData
    } = useNetwork();
    console.log(isNetWorkConnected);
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const { isConnected, device } = useSelector(
        (state: RootState) => state.connectDevice
    );
    const { devices: userDevices } = useSelector(
        (state: RootState) => state.device
    );
    const userId = auth.currentUser?.uid;
    const [valueOfSensor, setvalueOfSensor] = useState<DataSensor>(null);
    const [periodicReadingInterval, setPeriodicReadingInterval] =
        useState(null);
    // Thêm state cho Bluetooth
    const [bluetoothModalVisible, setBluetoothModalVisible] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [devices, setDevices] = useState<DeviceBluetooth[]>([]);
    const [bluetoothState, setBluetoothState] = useState<string>('Unknown');
    const bluetoothService = useRef<BluetoothService>(
        BluetoothService.getInstance()
    ).current;
    const [error, setError] = useState<string | null>(null);
    useEffect(() => {
        configureNotifications();
    }, []);
    const [isMonitoring, setIsMonitoring] = useState(false);
    const [subscription, setSubscription] = useState<any>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    // Lấy thông tin người dùng
    useEffect(() => {
        async function fetchDetailUser() {
            try {
                await dispatch(getUserProfile(userId)).unwrap();
            } catch (error) {
                console.log(error);
            }
        }
        async function fetchConnectedDevice() {
            try {
                await dispatch(fetchUserDevices(userId)).unwrap();
            } catch (error) {
                console.log(error);
            }
        }
        fetchDetailUser();
        fetchConnectedDevice();
    }, [userId]);

    // Thêm useEffect để kiểm tra trạng thái Bluetooth khi mở modal
    useEffect(() => {
        if (bluetoothModalVisible) {
            checkBluetoothState();
        }
    }, [bluetoothModalVisible]);

    // Hàm kiểm tra trạng thái Bluetooth
    const checkBluetoothState = async () => {
        const state = await bluetoothService.getBluetoothState();
        setBluetoothState(state);
    };
    console.log('IsScanning', isScanning);
    // Hàm quét thiết bị Bluetooth
    const scanDevices = async () => {
        setDevices([]);
        setIsScanning(true);
        try {
            // Đảm bảo bluetoothService đã được khởi tạo
            if (!bluetoothService) {
                console.error('BluetoothService chưa được khởi tạo');
                Alert.alert('Lỗi', 'Không thể khởi tạo dịch vụ Bluetooth');
                return;
            }

            // Thêm log để debug
            console.log('Bắt đầu quét thiết bị Bluetooth...');
            setTimeout(() => {
                setIsScanning(false);
            }, 15000);
            await bluetoothService.scanAllDevices((foundDevices) => {
                // Đảm bảo cập nhật state với mảng mới
                setDevices((prevDevices) => {
                    // Tạo một Map để loại bỏ các thiết bị trùng lặp
                    const deviceMap = new Map();
                    [...prevDevices, ...foundDevices].forEach((device) => {
                        device.hasBeenConnectd = false;
                        for (const userDevice of userDevices) {
                            if (userDevice.deviceId === device.id) {
                                device.name = userDevice.name;
                                device.hasBeenConnected = true;
                                break;
                            }
                        }

                        deviceMap.set(device.id, device);
                    });
                    return Array.from(deviceMap.values());
                });
            }, 15000); // Quét trong 15 giây
        } catch (error) {
            console.error('Lỗi khi quét thiết bị:', error);
            Alert.alert('Lỗi', 'Không thể quét thiết bị Bluetooth');
        }
    };

    // Hàm dừng quét
    const stopScan = async () => {
        await bluetoothService.stopScan();
        setIsScanning(false);
    };
    // Hàm kết nối thiết bị
    const connectToDevice = async (deviceId: string) => {
        try {
            const success = await bluetoothService.connectToDevice(deviceId);
            if (success) {
                const selectedDevice = bluetoothService.getDeviceInfo(deviceId);
                if (selectedDevice) {
                    console.log('selectedDevice', selectedDevice);
                    dispatch(
                        setConnectedDevice({
                            id: selectedDevice.id,
                            nameDisplay:
                                selectedDevice.name || 'Thiết bị không tên',
                            nameDefault:
                                selectedDevice.name || 'Thiết bị không tên'
                        })
                    );
                    dispatch(
                        addDevice({
                            userId,
                            deviceData: {
                                name:
                                    selectedDevice.name ||
                                    selectedDevice.localName ||
                                    'Thiết bị không tên',
                                deviceId: selectedDevice.id
                            }
                        })
                    );
                    setBluetoothModalVisible(false);
                    Alert.alert(
                        'Thành công',
                        `Đã kết nối với thiết bị ${
                            selectedDevice.name || selectedDevice.id
                        }`
                    );
                }
            } else {
                Alert.alert('Lỗi', 'Không thể kết nối với thiết bị');
            }
        } catch (error) {
            console.error('Lỗi khi kết nối thiết bị:', error);
            Alert.alert('Lỗi', 'Không thể kết nối với thiết bị');
        }
    };

    // Hàm bật Bluetooth
    const enableBluetooth = async () => {
        try {
            const enabled = await bluetoothService.enableBluetooth();
            if (enabled) {
                await checkBluetoothState();
                Alert.alert('Thành công', 'Bluetooth đã được bật');
            } else {
                Alert.alert('Thông báo', 'Vui lòng bật Bluetooth để tiếp tục');
            }
        } catch (error) {
            console.error('Lỗi khi bật Bluetooth:', error);
            Alert.alert('Lỗi', 'Không thể bật Bluetooth');
        }
    };
    const processSensorData = async (data: string | null) => {
        if (!data) {
            console.log('No data received from device.');
            return false;
        }
        const match = data.match(/SpO2:(\d+),HR:(\d+)/);
        if (!match) {
            console.log('Data format is incorrect.');
            return false;
        }
        const [_, spo2Value, hrValue] = match;
        const newHeartRate = parseInt(hrValue);
        const newSpO2 = parseInt(spo2Value);
        console.log('New heart rate:', newHeartRate, ' bpm');
        console.log('New SpO2:', newSpO2, ' %');
        const dataToFirebase = createDataFromSensor(
            userId,
            device.id,
            newHeartRate,
            newSpO2
        );
        try {
            setvalueOfSensor(dataToFirebase);

            return true;
        } catch (error) {
            console.error('Failed to send data to Firestore:', error);
            return false;
        }
    };

    // Đọc dữ liệu một lần
    const readSensorData = async () => {
        setError(null);
        if (!isConnected || !device) {
            setError('No device connected.');
            return false;
        }
        try {
            const data = await bluetoothService.readData(
                SENSOR_SERVICE_UUID,
                SENSOR_CHARACTERISTIC_UUID
            );
            const success = await processSensorData(data);
            if (!success && !data) {
                setError('Failed to read data from device.');
            }
            return success;
        } catch (error) {
            console.error('Read data error:', error);
            setError('Failed to read data: ' + error.message);
            return false;
        }
    };
    // Hàm bắt đầu theo dõi liên tục
    const startSensorMonitoring = async () => {
        setError(null);
        if (!isConnected || !device) {
            setError('No device connected.');
            return false;
        }
        if (periodicReadingInterval) {
            stopPeriodicReading();
        }

        if (isMonitoring) {
            await stopSensorMonitoring();
        }
        try {
            const sub = bluetoothService.monitorData(
                SENSOR_SERVICE_UUID,
                SENSOR_CHARACTERISTIC_UUID,
                async (data) => {
                    await processSensorData(data);
                }
            );
            if (sub) {
                setSubscription(sub);
                setIsMonitoring(true);
                console.log('Monitoring started successfully');
                return true;
            } else {
                console.log('Failed to start monitoring.');
                setError('Failed to start monitoring.');
                return false;
            }
        } catch (error) {
            console.error('Start monitoring error:', error);
            setError('Failed to start monitoring: ' + error.message);
            return false;
        }
    };
    const stopSensorMonitoring = async () => {
        try {
            if (subscription) {
                await subscription.remove();
                setSubscription(null);
            }
            setIsMonitoring(false);
            console.log('Monitoring stopped successfully');
            return true;
        } catch (error) {
            console.error('Stop monitoring error:', error);
            setError('Failed to stop monitoring: ' + error.message);
            return false;
        }
    };
    const startPeriodicReading = (intervalSeconds = 30) => {
        // Nếu đang theo dõi liên tục, dừng lại trước
        if (isMonitoring) {
            stopSensorMonitoring();
        }

        // Dừng interval hiện tại nếu có
        stopPeriodicReading();

        // Tạo interval mới
        const intervalId = setInterval(async () => {
            if (isConnected && device) {
                await readSensorData();
            }
        }, intervalSeconds * 1000);

        // Lưu ID của interval để có thể dừng sau này
        setPeriodicReadingInterval(intervalId);
        console.log(`Bắt đầu đọc dữ liệu định kỳ mỗi ${intervalSeconds} giây`);
    };
    // Hàm dừng đọc dữ liệu theo chu kỳ
    const stopPeriodicReading = () => {
        if (periodicReadingInterval) {
            clearInterval(periodicReadingInterval);
            setPeriodicReadingInterval(null);
            console.log('Đã dừng đọc dữ liệu định kỳ');
        }
    };
    // Tự động dừng theo dõi khi component unmount
    useEffect(() => {
        return () => {
            stopSensorMonitoring();
        };
    }, []);
    useEffect(() => {
        if (isConnected && device) {
            readSensorData();
            // startSensorMonitoring();
        } else {
            stopSensorMonitoring();
        }
    }, [isConnected, device]);
    // Render modal Bluetooth
    const renderBluetoothModal = () => {
        return (
            <Modal
                animationType='slide'
                transparent={true}
                visible={bluetoothModalVisible}
                onRequestClose={() => {
                    stopScan();
                    setBluetoothModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>
                                Thiết bị Bluetooth
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    stopScan();
                                    setBluetoothModalVisible(false);
                                }}
                            >
                                <Ionicons name='close' size={24} color='#333' />
                            </TouchableOpacity>
                        </View>

                        {bluetoothState !== 'PoweredOn' ? (
                            <View style={styles.bluetoothOffContainer}>
                                <Text style={styles.bluetoothOffText}>
                                    Bluetooth đang tắt
                                </Text>
                                <TouchableOpacity
                                    style={styles.enableBluetoothButton}
                                    onPress={enableBluetooth}
                                >
                                    <Text
                                        style={styles.enableBluetoothButtonText}
                                    >
                                        Bật Bluetooth
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View style={styles.scanButtonContainer}>
                                    <TouchableOpacity
                                        style={styles.scanButton}
                                        onPress={scanDevices}
                                        disabled={isScanning}
                                    >
                                        <Text style={styles.scanButtonText}>
                                            {isScanning
                                                ? 'Đang quét...'
                                                : 'Quét thiết bị'}
                                        </Text>
                                    </TouchableOpacity>
                                    {isScanning && (
                                        <TouchableOpacity
                                            style={styles.stopScanButton}
                                            onPress={stopScan}
                                        >
                                            <Text
                                                style={
                                                    styles.stopScanButtonText
                                                }
                                            >
                                                Dừng
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                {isScanning && (
                                    <View
                                        style={styles.loadingContainer}
                                        className='my-[30px]'
                                    >
                                        <ActivityIndicator
                                            size='large'
                                            color='#FF4757'
                                        />
                                    </View>
                                )}

                                <Text style={styles.deviceListTitle}>
                                    {devices.length > 0
                                        ? `Đã tìm thấy ${devices.length} thiết bị`
                                        : 'Không tìm thấy thiết bị nào'}
                                </Text>

                                <FlatList
                                    data={devices}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={styles.deviceItem}
                                            onPress={() =>
                                                connectToDevice(item.id)
                                            }
                                        >
                                            <View>
                                                <View className='flex-row gap-2'>
                                                    <Text
                                                        style={
                                                            styles.deviceName
                                                        }
                                                    >
                                                        {item.name ||
                                                            item.localName ||
                                                            'Thiết bị không tên'}
                                                    </Text>
                                                    <Text>
                                                        {item.hasBeenConnected
                                                            ? '(Đã từng kết nối)'
                                                            : ''}
                                                    </Text>
                                                </View>
                                                <Text style={styles.deviceId}>
                                                    ID: {item.id}
                                                </Text>
                                                {item.rssi && (
                                                    <Text
                                                        style={
                                                            styles.deviceRssi
                                                        }
                                                    >
                                                        Cường độ tín hiệu:{' '}
                                                        {item.rssi} dBm
                                                    </Text>
                                                )}
                                            </View>
                                            <Ionicons
                                                name='chevron-forward'
                                                size={20}
                                                color='#666'
                                            />
                                        </TouchableOpacity>
                                    )}
                                    ListEmptyComponent={
                                        !isScanning && (
                                            <Text style={styles.emptyListText}>
                                                Không tìm thấy thiết bị nào. Hãy
                                                nhấn "Quét thiết bị" để tìm
                                                kiếm.
                                            </Text>
                                        )
                                    }
                                    // style={styles.deviceList}
                                />
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        );
    };

    const { detailUser } = useSelector((state: RootState) => state.user);
    const onRefresh = async () => {
        setRefreshing(true);
        const isConnectedInternet = await checkConnection();
        if (isConnectedInternet) {
            try {
                await dispatch(getUserProfile(userId)).unwrap();
                await dispatch(fetchUserDevices(userId)).unwrap();
            } catch (error) {
                console.log(error);
            }
        }
        setRefreshing(false);
    };
    // Hiển thị cảnh báo khi không có kết nối mạng
    const alertNetWorkDisconnected = () => {
        if (!isNetWorkConnected) {
            return Alert.alert(
                'Không có kết nối mạng',
                'Một số tính năng có thể không hoạt động.',
                [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
            );
        } else {
            return null;
        }
    };
    // Hiển thị cảnh báo khi không có kết nối mạng
    const renderNetworkStatus = () => {
        if (!isNetWorkConnected) {
            return (
                <View style={styles.networkWarning}>
                    <Ionicons
                        name='cloud-offline-outline'
                        size={24}
                        color='#FF4757'
                    />
                    <Text style={styles.networkWarningText}>
                        Không có kết nối mạng. Một số tính năng có thể không
                        hoạt động.
                    </Text>
                </View>
            );
        }
        return null;
    };
    const renderSyncStatus = () => {
        if (pendingSyncCount > 0) {
            return (
                <View className='flex-row gap-2 items-center mt-[16px]'>
                    <Text>{pendingSyncCount} dữ liệu đang chờ đồng bộ</Text>
                    {!isNetWorkConnected && (
                        <TouchableOpacity
                            onPress={async () => {
                                const result = await syncOfflineData();
                                Alert.alert(
                                    'Kết quả đồng bộ dữ liệu',
                                    `Đã đồng bộ ${result.success} bản ghi. ${result.failed} bản ghi thất bại.`,
                                    [
                                        {
                                            text: 'OK',
                                            onPress: () =>
                                                console.log('OK Pressed')
                                        }
                                    ]
                                );
                            }}
                        >
                            <MaterialIcons
                                name='sync'
                                size={24}
                                color='black'
                            />
                        </TouchableOpacity>
                    )}
                </View>
            );
        }
        return null;
    };
    console.log('isConected', isConnected);
    const showHealthAlert = () => {
        Alert.alert(
            'Cảnh báo!',
            'Phát hiện chỉ số sức khỏe bất thường. Vui lòng kiểm tra ngay!',
            [
                {
                    text: 'Đóng cảnh báo',
                    onPress: () => {
                        setIsPlayingAlert(false);
                        stopAlertSound();
                    },
                    style: 'cancel'
                }
            ],
            { cancelable: true }
        );
    };
    useEffect(() => {
        if (isPlayingAlert) {
            showHealthAlert();
        }
    }, [isPlayingAlert]);
    useEffect(() => {
        alertNetWorkDisconnected();
    }, [isNetWorkConnected]);
    // Thay đổi hàm kết nối thiết bị để mở modal Bluetooth
    const handleStartConnectDevice = async () => {
        setBluetoothModalVisible(true);
    };

    const handleDisconnectDevice = async () => {
        try {
            await bluetoothService.disconnect();
            dispatch(disconnectedDevice());
            Alert.alert('Thông báo', 'Đã ngắt kết nối thiết bị');
        } catch (error) {
            console.error('Lỗi khi ngắt kết nối:', error);
            Alert.alert('Lỗi', 'Không thể ngắt kết nối thiết bị');
        }
    };

    return (
        <View style={styles.container}>
            {renderBluetoothModal()}
            {renderNetworkStatus()}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào,</Text>
                    <Text style={styles.userName}>
                        {detailUser?.nameDisplay}
                    </Text>
                    {renderSyncStatus()}
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('ProfileScreenStack')}
                >
                    <Ionicons name='settings-outline' size={24} color='#333' />
                </TouchableOpacity>
            </View>

            {/* Thêm nút kết nối thiết bị ở đây, trước ScrollView */}
            <View style={styles.deviceConnectionContainer} className='bg-white'>
                {isConnected ? (
                    <View>
                        <View style={styles.connectedDeviceInfo}>
                            <View style={styles.connectedDeviceTextContainer}>
                                <Text style={styles.connectedDeviceTitle}>
                                    Thiết bị đã kết nối
                                </Text>
                                <Text style={styles.connectedDeviceName}>
                                    {device?.nameDisplay ||
                                        'Thiết bị không tên'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.disconnectButton}
                                onPress={handleDisconnectDevice}
                            >
                                <Text style={styles.disconnectButtonText}>
                                    Ngắt kết nối
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <TouchableOpacity
                        style={styles.connectButton}
                        onPress={handleStartConnectDevice}
                    >
                        <Ionicons name='bluetooth' size={20} color='#fff' />
                        <Text style={styles.connectButtonText}>
                            Kết nối thiết bị
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
            {isConnected && (
                <View style={styles.deviceConnectionContainer}>
                    <Text style={styles.sectionTitle}>Điều khiển cảm biến</Text>
                    <View className='flex-row justify-between'>
                        <TouchableOpacity
                            className={`rounded-md p-2 ${
                                isMonitoring ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            onPress={
                                isMonitoring
                                    ? stopSensorMonitoring
                                    : startSensorMonitoring
                            }
                        >
                            <Text className='font-bold'>
                                {isMonitoring
                                    ? 'Dừng theo dõi'
                                    : 'Bắt đầu theo dõi'}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={readSensorData}
                            className='rounded-md p-2 bg-primary'
                        >
                            <Text className='font-bold'>
                                Đọc dữ liệu một lần
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#FF4757']}
                    />
                }
                className='bg-white'
            >
                <View style={styles.metricsContainer}>
                    <Text style={styles.sectionTitle}>
                        Chỉ số sức khỏe hiện tại
                    </Text>

                    <SectionHealthInfo
                        value={valueOfSensor}
                        setPlayingAlert={setIsPlayingAlert}
                        refreshing={refreshing}
                    />

                    <View style={styles.thresholdInfoContainer}>
                        <Text style={styles.thresholdTitle}>
                            Ngưỡng cảnh báo:
                        </Text>
                        <Text style={styles.thresholdInfo}>
                            Nhịp tim: {detailUser?.heartRateThreshold?.min} -{' '}
                            {detailUser?.heartRateThreshold?.max} bpm
                        </Text>
                        <Text style={styles.thresholdInfo}>
                            SpO2: {detailUser?.spo2Threshold?.min} -{' '}
                            {detailUser?.spo2Threshold?.max}%
                        </Text>
                    </View>
                    <View>
                        <RealTimeChart />
                    </View>
                    {/* <HealthArticleCarousel /> */}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666'
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        // paddingTop: 50,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    greeting: {
        fontSize: 16,
        color: '#666'
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333'
    },
    scrollView: {
        flex: 1
    },
    metricsContainer: {
        padding: 20
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        color: '#333'
    },
    thresholdInfoContainer: {
        marginTop: 10,
        padding: 15,
        backgroundColor: '#F5F5F5',
        borderRadius: 10
    },
    thresholdTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: '#333'
    },
    thresholdInfo: {
        fontSize: 14,
        color: '#666',
        marginBottom: 3
    },
    actionsContainer: {
        padding: 20,
        paddingTop: 0
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
        shadowRadius: 2
    },
    actionText: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333'
    },
    simulateButton: {
        backgroundColor: '#FF4757',
        marginTop: 10
    },
    simulateButtonText: {
        marginLeft: 10,
        fontSize: 16,
        color: 'white'
    },
    // Thêm styles mới
    stopSimulateButton: {
        backgroundColor: '#FF3B30',
        marginTop: 10
    },
    networkWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 10,
        marginHorizontal: 20,
        marginTop: 10,
        borderRadius: 8
    },
    networkWarningText: {
        marginLeft: 10,
        color: '#FF4757',
        flex: 1
    },
    // Styles cho phần kết nối thiết bị
    deviceConnectionContainer: {
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 12,
        marginHorizontal: 15,
        marginTop: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 10
    },
    connectButton: {
        backgroundColor: '#FF4757',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8
    },
    connectButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        marginLeft: 8
    },
    connectedDeviceInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    connectedDeviceTextContainer: {
        flex: 1
    },
    connectedDeviceTitle: {
        fontSize: 14,
        color: '#666'
    },
    connectedDeviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    disconnectButton: {
        backgroundColor: '#f0f0f0',
        padding: 8,
        borderRadius: 8
    },
    disconnectButtonText: {
        color: '#FF4757',
        fontWeight: 'bold'
    },

    // Styles cho modal Bluetooth
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center' // Thay đổi từ 'flex-end' thành 'center'
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 20, // Thay đổi từ chỉ bo góc trên thành bo tròn tất cả các góc
        margin: 20, // Thêm margin để không sát cạnh màn hình
        padding: 20,
        maxHeight: '80%', // Thay đổi từ height cố định thành maxHeight
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333'
    },
    bluetoothOffContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    bluetoothOffText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20
    },
    enableBluetoothButton: {
        backgroundColor: '#FF4757',
        padding: 12,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center'
    },
    enableBluetoothButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    scanButtonContainer: {
        flexDirection: 'row',
        marginBottom: 20
    },
    scanButton: {
        backgroundColor: '#FF4757',
        padding: 12,
        borderRadius: 8,
        flex: 1,
        alignItems: 'center'
    },
    scanButtonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
    stopScanButton: {
        backgroundColor: '#f0f0f0',
        padding: 12,
        borderRadius: 8,
        marginLeft: 10
    },
    stopScanButtonText: {
        color: '#666',
        fontWeight: 'bold'
    },
    deviceListTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    deviceList: {
        flex: 1,
        marginBottom: 10 // Thêm margin bottom để tránh nội dung bị cắt
    },
    deviceItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0'
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    deviceId: {
        fontSize: 12,
        color: '#666',
        marginTop: 4
    },
    deviceRssi: {
        fontSize: 12,
        color: '#666',
        marginTop: 2
    },
    emptyListText: {
        textAlign: 'center',
        padding: 20,
        color: '#666'
    }
});

export default HomeScreen;
