import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNetwork } from '@/context/NetWorkContext';
import { RootState } from '@/redux/store';
import { getLatestSensorData } from '@services/sensor.service';
import { auth } from '../../../../config/firebase';
import HealthMetricCard from './HealthMetricCard';
import DataSensor from '../../../../types/dataSensor.types';
export default function SectionHealthInfo({ value }: { value: DataSensor }) {
    const { heartRateThreshold, spo2Threshold } = useSelector(
        (state: RootState) => state.user?.detailUser
    );
    const [isWarning, setisWarning] = useState(false);
    const { isConnected: isNetWorkConnected } = useNetwork();
    const { isConnected } = useSelector(
        (state: RootState) => state.connectDevice
    );
    const [latestData, setLatestData] = useState(null);
    const fetchLatestSensorData = async () => {
        const result = await getLatestSensorData(
            auth.currentUser.uid || 'jgr8crtfoRSr0ErsJlc75k7g1sl1'
        );
        if (result) {
            setLatestData(result);
        }
    };
    useEffect(() => {
        fetchLatestSensorData();
    }, [isNetWorkConnected, isConnected]);
    return (
        <View>
            {!isConnected ? (
                <>
                    <HealthMetricCard
                        icon={'heart'}
                        title={'Nhịp tim'}
                        unit={'bpm'}
                        value={latestData?.heartRate}
                        field={'heartRate'}
                        createdAt={latestData?.createdAt
                            .toDate()
                            .toLocaleString()}
                        iconColor={'#FF4757'}
                    />
                    <HealthMetricCard
                        icon={'water'}
                        title={'Nồng độ Oxy trong máu'}
                        unit={'%'}
                        value={latestData?.spo2}
                        field={'spo2'}
                        createdAt={latestData?.createdAt
                            .toDate()
                            .toLocaleString()}
                        iconColor={'#2E86DE'}
                    />
                </>
            ) : (
                <>
                    <HealthMetricCard
                        icon={'heart'}
                        title={'Nhịp tim'}
                        unit={'bpm'}
                        value={value?.heartRate}
                        field={'heartRate'}
                        iconColor={'#FF4757'}
                    />
                    <HealthMetricCard
                        icon={'water'}
                        title={'Nồng độ Oxy trong máu'}
                        unit={'%'}
                        value={value?.spo2}
                        field={'spo2'}
                        iconColor={'#2E86DE'}
                    />
                </>
            )}
        </View>
    );
}
