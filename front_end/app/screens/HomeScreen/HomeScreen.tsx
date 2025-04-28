import { RootState } from '@/redux/store';
import { getUserProfile } from '@/redux/userSlice';
import { auth } from '@config/firebase';
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl,
    Alert
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import HealthMetricCard from './components/HealthMetricCard';
import {
    disconnectedDevice,
    setConnectedDevice
} from '@/redux/connectDeviceSlice';
import Card from '@/components/ui/Card';
import RealTimeChart from './components/RealTimeChart';
import { useNetwork } from '@/context/NetWorkContext';
import SectionHealthInfo from './components/SectionHealthInfo';
import {
    fakeDataFromSensor,
    sendDataSensorIntoFirestore
} from '@services/sensor.service';
import DataSensor from '../../../types/dataSensor.types';
const HomeScreen = ({ navigation }) => {
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
    const userId = auth.currentUser?.uid || 'jgr8crtfoRSr0ErsJlc75k7g1sl1';
    const [valueOfSensor, setvalueOfSensor] = useState<DataSensor>(null);
    useEffect(() => {
        let idInterval;
        if (isConnected) {
            idInterval = setInterval(async () => {
                const fakeData = fakeDataFromSensor(userId, device?.id);
                setvalueOfSensor(fakeData);
                await sendDataSensorIntoFirestore(fakeData);
            }, 10000);
        }
        return () => clearInterval(idInterval);
    }, [isConnected]);
    useEffect(() => {
        async function fetchDetailUser() {
            try {
                await dispatch(getUserProfile(userId)).unwrap();
            } catch (error) {
                console.log(error);
            }
        }
        fetchDetailUser();
    }, [userId]);
    const { detailUser } = useSelector((state: RootState) => state.user);
    const onRefresh = async () => {
        setRefreshing(true);
        const isConnected = await checkConnection();
        if (isConnected) {
            try {
                await dispatch(getUserProfile(userId)).unwrap();
            } catch (error) {
                console.log(error);
            }
        }
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
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
                    {!isConnected && (
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
    useEffect(() => {
        alertNetWorkDisconnected();
    }, [isNetWorkConnected]);
    const handleStartConnectDevice = async () => {
        const device = await new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: '1',
                    nameDisplay: 'Device 1',
                    nameDefault: 'Device 1'
                });
            }, 2000);
        });
        dispatch(setConnectedDevice(device));
    };
    const handleDisconnectDevice = () => {
        setTimeout(() => {
            dispatch(disconnectedDevice());
        }, 2000);
    };
    return (
        <View style={styles.container}>
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

                    <SectionHealthInfo value={valueOfSensor} />
                    {!isConnected ? (
                        <View>
                            <Text className='font-bold text-[18px]'>
                                Chưa có thiết bị kết nối nào.
                            </Text>
                            <Card className='mt-[10px]'>
                                <TouchableOpacity
                                    className='flex-row justify-between items-center'
                                    onPress={handleStartConnectDevice}
                                >
                                    <Text>Kết nối thiết bị nào</Text>
                                    <View className='w-[40px] h-[40px] bg-green-500 rounded-full justify-center items-center'>
                                        <MaterialIcons
                                            name='bluetooth-connected'
                                            size={24}
                                            color='white'
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Card>
                        </View>
                    ) : (
                        <View>
                            <Text className='font-bold text-[18px]'>
                                Đã kết nối với thiết bị
                            </Text>
                            <Card className='mt-[10px]'>
                                <TouchableOpacity
                                    className='flex-row justify-between items-center'
                                    onPress={handleDisconnectDevice}
                                >
                                    <Text>
                                        {device?.nameDisplay ||
                                            device?.nameDefault ||
                                            'Unknown'}
                                    </Text>
                                    <View className='w-[40px] h-[40px] bg-primary rounded-full justify-center items-center'>
                                        <MaterialIcons
                                            name='bluetooth-disabled'
                                            size={24}
                                            color='white'
                                        />
                                    </View>
                                </TouchableOpacity>
                            </Card>
                        </View>
                    )}

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
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9'
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
        paddingTop: 50,
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
        fontSize: 14,
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
        shadowRadius: 2,
        elevation: 2
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
    }
});

export default HomeScreen;
