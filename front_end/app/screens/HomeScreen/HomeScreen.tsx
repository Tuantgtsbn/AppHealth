import { RootState } from '@/redux/store';
import { getUserProfile } from '@/redux/userSlice';
import { auth } from '@config/firebase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    RefreshControl
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import HealthMetricCard from './components/HealthMetricCard';
import DailyChartScreen from './components/DailyChartScreen';
import MonthlyChartScreen from './components/MonthlyChartScreen';
import HealthArticleCarousel from './components/HealthArticleCarousel';
const HomeScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const [refreshing, setRefreshing] = useState(false);
    const user = auth.currentUser;
    console.log('User', user);
    // const { uid: id = 'jgr8crtfoRSr0ErsJlc75k7g1sl1' } = useSelector(
    //     (state) => state?.auth?.user
    // );
    const id = 'jgr8crtfoRSr0ErsJlc75k7g1sl1';
    useEffect(() => {
        async function fetchDetailUser() {
            try {
                await dispatch(getUserProfile(id)).unwrap();
            } catch (error) {
                console.log(error);
            }
        }
        fetchDetailUser();
    }, [id]);
    const { detailUser } = useSelector((state: RootState) => state.user);
    const onRefresh = () => {
        setRefreshing(true);
        setTimeout(() => {
            setRefreshing(false);
        }, 2000);
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Xin chào,</Text>
                    <Text style={styles.userName}>
                        {detailUser?.nameDisplay}
                    </Text>
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
            >
                <View style={styles.metricsContainer}>
                    <Text style={styles.sectionTitle}>
                        Chỉ số sức khỏe hiện tại
                    </Text>

                    <HealthMetricCard
                        title='Nhịp tim'
                        unit='bpm'
                        icon='heart'
                        iconColor='#FF4757'
                    />

                    <HealthMetricCard
                        title='Nồng độ Oxy trong máu'
                        unit='%'
                        icon='water'
                        iconColor='#2E86DE'
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
                </View>

                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Daily')}
                    >
                        <Ionicons
                            name='calendar-outline'
                            size={24}
                            color='#FF4757'
                        />
                        <Text style={styles.actionText}>Biểu đồ theo ngày</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('Monthly')}
                    >
                        <Ionicons
                            name='bar-chart-outline'
                            size={24}
                            color='#FF4757'
                        />
                        <Text style={styles.actionText}>
                            Biểu đồ theo tháng
                        </Text>
                    </TouchableOpacity>
                    <DailyChartScreen />
                    <MonthlyChartScreen />
                    <HealthArticleCarousel />
                    {/* Thay thế nút "Giả lập đọc dữ liệu mới" bằng 2 nút sau trong phần render */}
                    {/* <TouchableOpacity 
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
            </TouchableOpacity>  */}
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
    }
});

export default HomeScreen;
