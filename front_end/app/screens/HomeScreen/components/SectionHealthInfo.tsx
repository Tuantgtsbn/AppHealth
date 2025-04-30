import { View, Text } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNetwork } from '@/context/NetWorkContext';
import { RootState } from '@/redux/store';
import { getLatestSensorData } from '@services/sensor.service';
import { auth } from '../../../../config/firebase';
import HealthMetricCard from './HealthMetricCard';
import DataSensor from '../../../../types/dataSensor.types';
import {
    handleHealthAlert,
    sendAlertEmail
} from '@services/notification.service';
export default function SectionHealthInfo({
    value,
    setPlayingAlert
}: {
    value: DataSensor;
    setPlayingAlert: any;
}) {
    const { heartRateThreshold, spo2Threshold } = useSelector(
        (state: RootState) => state.user?.detailUser
    );
    const { soundAlerts } = useSelector(
        (state: RootState) => state.user?.detailUser
    );
    const [isWarningHeartRate, setIsWarningHeartRate] = useState(false);
    const [isWarningSpo2, setIsWarningSpo2] = useState(false);

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
    const userId = auth.currentUser?.uid;
    useEffect(() => {
        fetchLatestSensorData();
    }, [isNetWorkConnected, isConnected]);
    const checkWarning = () => {
        if (!isConnected) {
            if (
                latestData?.heartRate < (heartRateThreshold?.min || 60) ||
                latestData?.heartRate > (heartRateThreshold?.max || 100)
            ) {
                setIsWarningHeartRate(true);
            } else {
                setIsWarningHeartRate(false);
            }
            if (
                latestData?.spo2 < (spo2Threshold?.min || 95) ||
                latestData?.spo2 > (spo2Threshold?.max || 100)
            ) {
                setIsWarningSpo2(true);
            } else {
                setIsWarningSpo2(false);
            }
        } else {
            if (
                value?.heartRate < (heartRateThreshold?.min || 60) ||
                value?.heartRate > (heartRateThreshold?.max || 100)
            ) {
                setIsWarningHeartRate(true);
                setPlayingAlert(true);
                handleHealthAlert(
                    userId,
                    'heartRate',
                    value?.heartRate,
                    heartRateThreshold || { min: 60, max: 100 },
                    soundAlerts || 'sound'
                );
            } else {
                setIsWarningHeartRate(false);
            }
            if (
                value?.spo2 < (spo2Threshold?.min || 95) ||
                value?.spo2 > (spo2Threshold?.max || 100)
            ) {
                setIsWarningSpo2(true);
                setPlayingAlert(true);
                handleHealthAlert(
                    userId,
                    'spo2',
                    value?.spo2,
                    spo2Threshold || { min: 95, max: 100 },
                    soundAlerts || 'sound'
                );
            } else {
                setIsWarningSpo2(false);
            }
        }
    };
    useEffect(() => {
        checkWarning();
    }, [value, latestData]);
    return (
        <View>
            {!isConnected ? (
                <>
                    <HealthMetricCard
                        icon={'heart'}
                        title={'Nhịp tim'}
                        unit={'bpm'}
                        value={latestData?.heartRate}
                        createdAt={latestData?.createdAt
                            .toDate()
                            .toLocaleString()}
                        iconColor={'#FF4757'}
                        isWarning={isWarningHeartRate}
                    />
                    <HealthMetricCard
                        icon={'water'}
                        title={'Nồng độ Oxy trong máu'}
                        unit={'%'}
                        value={latestData?.spo2}
                        createdAt={latestData?.createdAt
                            .toDate()
                            .toLocaleString()}
                        iconColor={'#2E86DE'}
                        isWarning={isWarningSpo2}
                    />
                </>
            ) : (
                <>
                    <HealthMetricCard
                        icon={'heart'}
                        title={'Nhịp tim'}
                        unit={'bpm'}
                        value={value?.heartRate}
                        iconColor={'#FF4757'}
                        isWarning={isWarningHeartRate}
                    />
                    <HealthMetricCard
                        icon={'water'}
                        title={'Nồng độ Oxy trong máu'}
                        unit={'%'}
                        value={value?.spo2}
                        iconColor={'#2E86DE'}
                        isWarning={isWarningSpo2}
                    />
                </>
            )}
        </View>
    );
}
