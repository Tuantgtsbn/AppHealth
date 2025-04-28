import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Text,
    View,
    StyleSheet,
    TouchableOpacity,
    ScrollView
} from 'react-native';
import DailyChartScreen from '../HomeScreen/components/DailyChartScreen';
import MonthlyChartScreen from '../HomeScreen/components/MonthlyChartScreen';
export default function AnalyticsScreen() {
    const [isOpenDailyChart, setIsOpenDailyChart] = useState(false);
    const [isOpenMonthlyChart, setIsOpenMonthlyChart] = useState(false);
    return (
        <ScrollView style={styles.container}>
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setIsOpenDailyChart(!isOpenDailyChart)}
                >
                    <Ionicons
                        name='calendar-outline'
                        size={24}
                        color='#FF4757'
                    />
                    <Text style={styles.actionText}>Biểu đồ theo ngày</Text>
                </TouchableOpacity>
                {isOpenDailyChart && <DailyChartScreen />}
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => setIsOpenMonthlyChart(!isOpenMonthlyChart)}
                >
                    <Ionicons
                        name='bar-chart-outline'
                        size={24}
                        color='#FF4757'
                    />
                    <Text style={styles.actionText}>Biểu đồ theo tháng</Text>
                </TouchableOpacity>

                {isOpenMonthlyChart && <MonthlyChartScreen />}
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    actionsContainer: {
        padding: 20
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
    }
});
