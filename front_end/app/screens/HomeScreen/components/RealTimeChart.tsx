import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Dimensions,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { auth, db } from '@config/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    Timestamp
} from 'firebase/firestore';
import moment from 'moment';
const { width } = Dimensions.get('window');
type HealthData = {
    heartRate: number;
    spo2: number;
    createdAt: Timestamp;
    timeLabel: string;
};
type ChartData = {
    labels: string[];
    datasets: {
        data: number[];
        color: (opacity: number) => string;
        strokeWidth: number;
    }[];
};
const RealTimeChart = () => {
    const [loading, setLoading] = useState(true);
    const [healthData, setHealthData] = useState<HealthData[]>([]);
    const [heartRateData, setHeartRateData] = useState<ChartData>({
        labels: [],
        datasets: [
            {
                data: [],
                color: (opacity = 1) => `rgba(255, 71, 87, ${opacity})`,
                strokeWidth: 2
            }
        ]
    });
    const [spo2Data, setSpo2Data] = useState<ChartData>({
        labels: [],
        datasets: [
            {
                data: [],
                color: (opacity = 1) => `rgba(46, 134, 222, ${opacity})`,
                strokeWidth: 2
            }
        ]
    });
    useEffect(() => {
        const userId = auth.currentUser?.uid;
        if (!userId) return;
        setLoading(true);
        // Tạo query để lấy 10 bản ghi mới nhất
        const healthDataQuery = query(
            collection(db, 'DataSensors'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
        // Thiết lập listener realtime
        const unsubscribe = onSnapshot(
            healthDataQuery,
            (snapshot) => {
                const newData: HealthData[] = [];
                snapshot.forEach((doc) => {
                    const data = doc.data();
                    newData.push({
                        heartRate: data.heartRate || 0,
                        spo2: data.spo2 || 0,
                        createdAt: data.createdAt,
                        timeLabel: moment(data.createdAt.toDate()).format(
                            'HH:mm:ss'
                        )
                    });
                });
                // Sắp xếp lại theo thứ tự thời gian tăng dần để hiển thị trên biểu đồ
                newData.sort(
                    (a, b) =>
                        a.createdAt.toDate().getTime() -
                        b.createdAt.toDate().getTime()
                );
                setHealthData(newData);
                console.log('Cập nhật dữ liệu realtime thành công');
                // Cập nhật dữ liệu biểu đồ
                updateChartData(newData);
                setLoading(false);
            },
            (error) => {
                console.error('Lỗi khi lấy dữ liệu realtime:', error);
                setLoading(false);
            }
        );
        return () => unsubscribe();
    }, []);
    // useEffect(() => {
    //     updateChartData(healthData);
    // }, [healthData]);
    const updateChartData = (data: HealthData[]) => {
        if (data.length === 0) return;
        const labels = data.map((item) => item.timeLabel);
        const heartRates = data.map((item) => item.heartRate);
        const spo2Values = data.map((item) => item.spo2);
        setHeartRateData({
            labels,
            datasets: [
                {
                    data: heartRates,
                    color: (opacity = 1) => `rgba(255, 71, 87, ${opacity})`,
                    strokeWidth: 2
                }
            ]
        });
        setSpo2Data({
            labels,
            datasets: [
                {
                    data: spo2Values,
                    color: (opacity = 1) => `rgba(46, 134, 222, ${opacity})`,
                    strokeWidth: 2
                }
            ]
        });
    };
    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: { borderRadius: 16 },
        propsForDots: {
            r: '6',
            strokeWidth: '2'
        }
    };
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Dữ liệu theo thời gian thực</Text>
            <Text style={styles.subtitle}>10 lần đo gần nhất</Text>
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color='#FF4757' />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Nhịp tim (bpm)</Text>
                        {heartRateData.datasets[0].data.length > 0 ? (
                            <ScrollView
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20 }}
                            >
                                <LineChart
                                    data={heartRateData}
                                    width={Math.max(
                                        width - 40,
                                        heartRateData.labels.length * 60
                                    )} // Đảm bảo đủ rộng cho tất cả labels
                                    height={220}
                                    chartConfig={{
                                        ...chartConfig,
                                        color: (opacity = 1) =>
                                            `rgba(255, 71, 87, ${opacity})`
                                    }}
                                    bezier
                                    style={styles.chart}
                                />
                            </ScrollView>
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>
                                    Không có dữ liệu nhịp tim cho ngày này
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>SpO2 (%)</Text>
                        {spo2Data.datasets[0].data.length > 0 ? (
                            <ScrollView
                                horizontal={true}
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ paddingRight: 20 }}
                            >
                                <LineChart
                                    data={spo2Data}
                                    width={Math.max(
                                        width - 40,
                                        spo2Data.labels.length * 60
                                    )} // Đảm bảo đủ rộng cho tất cả labels
                                    height={220}
                                    chartConfig={{
                                        ...chartConfig,
                                        color: (opacity = 1) =>
                                            `rgba(46, 134, 222, ${opacity})`
                                    }}
                                    bezier
                                    style={styles.chart}
                                />
                            </ScrollView>
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>
                                    Không có dữ liệu SpO2 cho ngày này
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F9F9',
        borderRadius: 12,
        marginTop: 20
    },
    header: {
        padding: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        paddingLeft: 20,
        marginTop: 20
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
        paddingLeft: 20
    },
    dateSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    dateText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333'
    },
    dateNavButton: {
        fontSize: 18,
        color: '#FF4757',
        paddingHorizontal: 10
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
    scrollView: {
        flex: 1,
        padding: 20
    },
    chartContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    chartTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333'
    },
    chart: {
        marginVertical: 8,
        borderRadius: 16
    },
    noDataContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noDataText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center'
    }
});

export default RealTimeChart;
