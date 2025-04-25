import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Dimensions
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { auth, db } from '@config/firebase';
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    Timestamp
} from 'firebase/firestore';
import moment from 'moment';
import 'moment/locale/vi'; // Sử dụng ngôn ngữ tiếng Việt

moment.locale('vi'); // Thiết lập ngôn ngữ tiếng Việt

const { width } = Dimensions.get('window');
type HeartRateData = {
    labels: string[];
    datasets: {
        data: number[];
        color: (opacity: number) => string;
        strokeWidth: number;
    }[];
};
type Spo2Data = {
    labels: string[];
    datasets: {
        data: number[];
        color: (opacity: number) => string;
        strokeWidth: number;
    }[];
};

const DailyChartScreen = () => {
    const [selectedDate, setSelectedDate] = useState(moment());
    const [heartRateData, setHeartRateData] = useState<HeartRateData>(null);
    const [spo2Data, setSpo2Data] = useState<Spo2Data>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDailyData(selectedDate);
    }, [selectedDate]);

    const loadDailyData = async (date) => {
        try {
            setLoading(true);

            const userId =
                auth?.currentUser?.uid || 'jgr8crtfoRSr0ErsJlc75k7g1sl1';
            const startOfDay = date.clone().startOf('day').toDate();
            const endOfDay = date.clone().endOf('day').toDate();

            // Truy vấn dữ liệu sức khỏe trong ngày
            const healthDataQuery = query(
                collection(db, 'DataSensors'),
                where('userId', '==', userId),
                where('createdAt', '>=', Timestamp.fromDate(startOfDay)),
                where('createdAt', '<=', Timestamp.fromDate(endOfDay)),

                orderBy('createdAt', 'asc')
            );

            const querySnapshot = await getDocs(healthDataQuery);

            const heartRates = [];
            const spo2Values = [];
            const timeLabels = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                heartRates.push(data.heartRate);
                spo2Values.push(data.spo2);
                timeLabels.push(
                    moment(data.createdAt.toDate()).format('HH:mm')
                );
            });

            // Nếu không có dữ liệu, tạo dữ liệu giả để demo
            if (heartRates.length === 0 && spo2Values.length === 0) {
                // Tạo 6 mốc thời gian trong ngày
                const mockTimes = [8, 10, 12, 14, 16, 18];

                mockTimes.forEach((hour) => {
                    const mockHeartRate = Math.floor(65 + Math.random() * 25); // 65-90
                    const mockSpo2 = Math.floor(94 + Math.random() * 7); // 94-100

                    heartRates.push(mockHeartRate);
                    spo2Values.push(mockSpo2);
                    timeLabels.push(`${hour}:00`);
                });
            }

            setHeartRateData({
                labels: timeLabels,
                datasets: [
                    {
                        data: heartRates,
                        color: (opacity = 1) => `rgba(255, 71, 87, ${opacity})`,
                        strokeWidth: 2
                    }
                ]
            });

            setSpo2Data({
                labels: timeLabels,
                datasets: [
                    {
                        data: spo2Values,
                        color: (opacity = 1) =>
                            `rgba(46, 134, 222, ${opacity})`,
                        strokeWidth: 2
                    }
                ]
            });
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu theo ngày:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeDate = (days) => {
        setSelectedDate(selectedDate.clone().add(days, 'days'));
    };

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        style: {
            borderRadius: 16
        },
        propsForDots: {
            r: '6',
            strokeWidth: '2'
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Biểu đồ theo ngày</Text>
            </View>

            <View style={styles.dateSelector}>
                <TouchableOpacity onPress={() => changeDate(-1)}>
                    <Text style={styles.dateNavButton}>《</Text>
                </TouchableOpacity>
                <Text style={styles.dateText}>
                    {selectedDate.format('dddd, DD/MM/YYYY')}
                </Text>
                <TouchableOpacity onPress={() => changeDate(1)}>
                    <Text style={styles.dateNavButton}>》</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color='#FF4757' />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <ScrollView style={styles.scrollView}>
                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>Nhịp tim (bpm)</Text>
                        {heartRateData?.datasets &&
                        heartRateData?.datasets[0].data.length > 0 ? (
                            <LineChart
                                data={heartRateData}
                                width={width - 40}
                                height={220}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) =>
                                        `rgba(255, 71, 87, ${opacity})`
                                }}
                                bezier
                                style={styles.chart}
                            />
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
                        {spo2Data?.datasets &&
                        spo2Data?.datasets[0].data.length > 0 ? (
                            <LineChart
                                data={spo2Data}
                                width={width - 40}
                                height={220}
                                chartConfig={{
                                    ...chartConfig,
                                    color: (opacity = 1) =>
                                        `rgba(46, 134, 222, ${opacity})`
                                }}
                                bezier
                                style={styles.chart}
                            />
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
        backgroundColor: '#F9F9F9'
    },
    header: {
        padding: 20,
        paddingTop: 50,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
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

export default DailyChartScreen;
