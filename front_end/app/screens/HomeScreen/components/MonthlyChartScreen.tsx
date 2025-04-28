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
import 'moment/locale/vi';
import type { Moment } from 'moment';
moment.locale('vi');

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

const MonthlyChartScreen = () => {
    const [selectedMonth, setSelectedMonth] = useState<moment.Moment>(moment());
    const [heartRateData, setHeartRateData] = useState<HeartRateData>({
        labels: [],
        datasets: [
            {
                data: [],
                color: (opacity = 1) => `rgba(255, 71, 87, ${opacity})`,
                strokeWidth: 2
            }
        ]
    });
    const [spo2Data, setSpo2Data] = useState<Spo2Data>({
        labels: [],
        datasets: [
            {
                data: [],
                color: (opacity = 1) => `rgba(46, 134, 222, ${opacity})`,
                strokeWidth: 2
            }
        ]
    });
    const [loading, setLoading] = useState(true);
    const [isEmpty, setIsEmpty] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        loadMonthlyData(selectedMonth);
    }, [selectedMonth]);

    const loadMonthlyData = async (date: moment.Moment) => {
        try {
            setLoading(true);

            const userId =
                auth.currentUser?.uid || 'jgr8crtfoRSr0ErsJlc75k7g1sl1';
            if (!userId) {
                console.error('Người dùng chưa đăng nhập');
                setLoading(false);
                return;
            }

            const startOfMonth = date.clone().startOf('month').toDate();
            const endOfMonth = date.clone().endOf('month').toDate();
            console.log(startOfMonth, endOfMonth);

            // Truy vấn dữ liệu sức khỏe trong tháng
            const healthDataQuery = query(
                collection(db, 'DataSensors'),
                where('userId', '==', userId),
                where('createdAt', '>=', Timestamp.fromDate(startOfMonth)),
                where('createdAt', '<=', Timestamp.fromDate(endOfMonth)),
                orderBy('createdAt', 'asc')
            );

            const querySnapshot = await getDocs(healthDataQuery);
            if (querySnapshot.empty) {
                console.log(true);
                setIsEmpty(true);
                setLoading(false);
                return;
            } else {
                setIsEmpty(false);
            }

            // Tạo đối tượng để nhóm dữ liệu theo ngày
            const dailyData = {};
            const maxDaysInMonth = (() => {
                const currentMonth = moment().month();
                const currentYear = moment().year();

                // Nếu là tháng hiện tại, lấy ngày hiện tại
                if (
                    date.month() === currentMonth &&
                    date.year() === currentYear
                ) {
                    return moment().date();
                }
                // Nếu là tháng trong quá khứ, lấy tổng số ngày trong tháng
                return date.daysInMonth();
            })();
            console.log(maxDaysInMonth);
            // Khởi tạo mảng cho tất cả các ngày trong tháng
            for (let i = 1; i <= maxDaysInMonth; i++) {
                const dayStr = i.toString();
                dailyData[dayStr] = {
                    heartRates: [],
                    spo2Values: []
                };
            }

            // Phân loại dữ liệu theo ngày
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                console.log(data);
                if (data.createdAt) {
                    const dayOfMonth = moment(data.createdAt.toDate())
                        .date()
                        .toString();

                    if (dailyData[dayOfMonth]) {
                        if (typeof data.heartRate === 'number') {
                            dailyData[dayOfMonth].heartRates.push(
                                data.heartRate
                            );
                        }
                        if (typeof data.spo2 === 'number') {
                            dailyData[dayOfMonth].spo2Values.push(data.spo2);
                        }
                    }
                }
            });

            // Tính giá trị trung bình cho mỗi ngày
            const daysOfMonth = [];
            const avgHeartRates = [];
            const avgSpo2Values = [];

            Object.keys(dailyData).forEach((day) => {
                daysOfMonth.push(day);

                const hrValues = dailyData[day].heartRates;
                const spo2Values = dailyData[day].spo2Values;

                // Nếu không có dữ liệu thực, tạo dữ liệu giả
                if (hrValues.length === 0) {
                    avgHeartRates.push(0);
                } else {
                    // Đảm bảo dữ liệu là mảng và không rỗng trước khi sử dụng reduce
                    const sum = hrValues.reduce((acc, val) => acc + val, 0);
                    avgHeartRates.push(Math.round(sum / hrValues.length));
                }

                if (spo2Values.length === 0) {
                    avgSpo2Values.push(0); // 94-100
                } else {
                    // Đảm bảo dữ liệu là mảng và không rỗng trước khi sử dụng reduce
                    const sum = spo2Values.reduce((acc, val) => acc + val, 0);
                    avgSpo2Values.push(Math.round(sum / spo2Values.length));
                }
            });

            // Tạo dữ liệu cho biểu đồ nhịp tim
            setHeartRateData({
                labels: daysOfMonth,
                datasets: [
                    {
                        data: avgHeartRates,
                        color: (opacity = 1) => `rgba(255, 71, 87, ${opacity})`,
                        strokeWidth: 2
                    }
                ]
            });
            console.log(avgHeartRates, avgSpo2Values);
            // Tạo dữ liệu cho biểu đồ SpO2
            setSpo2Data({
                labels: daysOfMonth,
                datasets: [
                    {
                        data: avgSpo2Values,
                        color: (opacity = 1) =>
                            `rgba(46, 134, 222, ${opacity})`,
                        strokeWidth: 2
                    }
                ]
            });
        } catch (error) {
            console.error('Lỗi khi tải dữ liệu theo tháng:', error);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (months) => {
        setSelectedMonth(selectedMonth.clone().add(months, 'months'));
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
            r: '4',
            strokeWidth: '2'
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Biểu đồ theo tháng</Text>
            </View>

            <View style={styles.monthSelector}>
                <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <Text style={styles.monthNavButton}>《</Text>
                </TouchableOpacity>
                <Text style={styles.monthText}>
                    {selectedMonth.format('MMMM YYYY')}
                </Text>
                <TouchableOpacity onPress={() => changeMonth(1)}>
                    <Text style={styles.monthNavButton}>》</Text>
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
                        <Text style={styles.chartTitle}>
                            Nhịp tim trung bình (bpm)
                        </Text>
                        {!isEmpty ? (
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
                        ) : error ? (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>
                                    Đã xảy ra lỗi khi tải dữ liệu
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>
                                    Không có dữ liệu nhịp tim
                                </Text>
                            </View>
                        )}

                        <Text style={styles.chartNote}>
                            * Giá trị trung bình hàng ngày
                        </Text>
                    </View>

                    <View style={styles.chartContainer}>
                        <Text style={styles.chartTitle}>
                            SpO2 trung bình (%)
                        </Text>
                        {!isEmpty ? (
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
                        ) : error ? (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>
                                    Đã xảy ra lỗi khi tải dữ liệu
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.noDataContainer}>
                                <Text style={styles.noDataText}>
                                    Không có dữ liệu SpO2
                                </Text>
                            </View>
                        )}

                        <Text style={styles.chartNote}>
                            * Giá trị trung bình hàng ngày
                        </Text>
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
        padding: 10,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333'
    },
    monthSelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: 'white',
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0'
    },
    monthText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textTransform: 'capitalize'
    },
    monthNavButton: {
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
    chartNote: {
        fontSize: 12,
        color: '#666',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: 5
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

export default MonthlyChartScreen;
