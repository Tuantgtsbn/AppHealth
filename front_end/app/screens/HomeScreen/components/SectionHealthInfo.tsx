import { View, Text } from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNetwork } from '@/context/NetWorkContext';
import { RootState } from '@/redux/store';
import {
    getLatestSensorData,
    sendDataSensorIntoFirestore
} from '@services/sensor.service';
import { auth } from '../../../../config/firebase';
import HealthMetricCard from './HealthMetricCard';
import DataSensor from '../../../../types/dataSensor.types';
import modelService from '../../../../ServicesAI/modelService';
import makePrediction from '../../../../ServicesAI/makePrediction';
import {
    handleHealthAlert,
    sendAlertEmail
} from '@services/notification.service';
import Toast from 'react-native-toast-message';
export default memo(function SectionHealthInfo({
    value,
    setPlayingAlert,
    refreshing
}: {
    value: DataSensor;
    setPlayingAlert: any;
    refreshing: boolean;
}) {
    const {
        heartRateThreshold,
        spo2Threshold,
        has_diabetes,
        has_hypertension,
        gender,
        dateOfBirth,
        weight,
        height
    } = useSelector((state: RootState) => state.user?.detailUser);
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
        console.log('fetch tai section health info');
        const result = await getLatestSensorData(auth.currentUser.uid);
        if (result) {
            setLatestData(result);
        }
    };
    const userId = auth.currentUser?.uid;
    useEffect(() => {
        if (isNetWorkConnected || refreshing) {
            fetchLatestSensorData();
        }
    }, [isNetWorkConnected, refreshing]);
    useEffect(() => {
        async function loadModal() {
            await modelService.initModel();
        }
        if (!modelService && !modelService.getModel()) {
            loadModal();
        }
    }, []);
    const [accuracy, setAccuracy] = useState(0);
    const predict = async (heartRate, spo2) => {
        if (modelService && modelService.getModel()) {
            try {
                console.log('chieu cao la     fdjfhdjf', height.value);
                let heightMeter =
                    height.unit === 'cm'
                        ? parseFloat(height.value) / 100
                        : parseFloat(height.value);
                let weightKg =
                    weight.unit === 'bound'
                        ? parseFloat(weight.value) * 0.453592
                        : parseFloat(weight.value);
                console.log('heightMeter', heightMeter);
                console.log('weightKg', weightKg);
                const BMI = Math.floor(weightKg / heightMeter ** 2);
                const Age =
                    new Date().getFullYear() -
                    new Date(dateOfBirth).getFullYear();
                const userInput = {
                    Age: Age,
                    Gender: gender,
                    Region: 'North',
                    'Urban/Rural': 'Urban',
                    SES: 'Middle',
                    'Smoking Status': 'Never',
                    'Alcohol Consumption': 'Never',
                    'Diet Type': 'Non-Vegetarian',
                    'Physical Activity Level': 'Moderate',
                    'Screen Time (hrs/day)': 2,
                    'Sleep Duration (hrs/day)': 8,
                    'Family History of Heart Disease': 'No',
                    Diabetes: has_diabetes ? 'Yes' : 'No',
                    Hypertension: has_hypertension ? 'Yes' : 'No',
                    'Cholesterol Levels': 150,
                    BMI: BMI,
                    'Stress Level': 'Medium',
                    'Resting Heart Rate': heartRate || 90,
                    'ECG Results': 'Normal',
                    'Chest Pain Type': 'Non-anginal',
                    'Maximum Heart Rate Achieved': 150,
                    'Exercise Induced Angina': 'No',
                    'Blood Oxygen Levels (SpO2%)': spo2 || 95,
                    'Triglyceride Levels (mg/dL)': 100,
                    'Blood Pressure': '180/110'
                };
                const prediction = await makePrediction(
                    modelService.getModel(),
                    userInput
                );
                console.log('Dự đoán:', prediction);
                return prediction;
            } catch (error) {
                throw new Error('Prediction error');
            }
        } else {
            throw new Error('Model not loaded');
        }
    };
    // predict(150, 40);
    const checkWarning = async () => {
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
            let result = '';
            try {
                console.log('value', value);
                result = await predict(value?.heartRate || 0, value?.spo2 || 0);
                console.log('Ket qua du doan', result);
                setAccuracy(Number(result));
                if (Number(result) > 0.25) {
                    setIsWarningHeartRate(true);
                    setIsWarningSpo2(true);
                    setPlayingAlert(true);
                    handleHealthAlert(
                        userId,
                        'stroke',
                        result,
                        '',
                        soundAlerts || 'sound'
                    );
                }
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: error.message
                });
            }
            try {
                await sendDataSensorIntoFirestore({
                    ...value,
                    isStroke: Number(result) > 0.25,
                    accuracy: Number(result)
                });
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: error.message
                });
            }
            if (
                value?.heartRate < (heartRateThreshold?.min || 60) ||
                value?.heartRate > (heartRateThreshold?.max || 100)
            ) {
                setIsWarningHeartRate(true);

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
    }, [value?.createdAt?.toMillis(), latestData?.createdAt?.toMillis()]);
    return (
        <View>
            {!isConnected ? (
                <>
                    <HealthMetricCard
                        type={'heartRate'}
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
                        type={'spo2'}
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
                    <HealthMetricCard
                        type={'stroke'}
                        icon={'warning'}
                        title={'Nguy cơ đột quỵ'}
                        unit={'%'}
                        value={latestData?.accuracy}
                        createdAt={latestData?.createdAt
                            .toDate()
                            .toLocaleString()}
                        iconColor={'#FFD700'}
                        isWarning={latestData?.isStroke || false}
                    />
                </>
            ) : (
                <>
                    <HealthMetricCard
                        type={'heartRate'}
                        icon={'heart'}
                        title={'Nhịp tim'}
                        unit={'bpm'}
                        value={value?.heartRate}
                        createdAt={value?.createdAt.toDate().toLocaleString()}
                        iconColor={'#FF4757'}
                        isWarning={isWarningHeartRate}
                    />
                    <HealthMetricCard
                        type={'spo2'}
                        icon={'water'}
                        title={'Nồng độ Oxy trong máu'}
                        createdAt={value?.createdAt.toDate().toLocaleString()}
                        unit={'%'}
                        value={value?.spo2}
                        iconColor={'#2E86DE'}
                        isWarning={isWarningSpo2}
                    />
                    <HealthMetricCard
                        type={'stroke'}
                        icon={'warning'}
                        title={'Nguy cơ đột quỵ'}
                        unit={'%'}
                        value={accuracy}
                        createdAt={value?.createdAt.toDate().toLocaleString()}
                        iconColor={'#FFD700'}
                        isWarning={accuracy > 0.25 || false}
                    />
                </>
            )}
        </View>
    );
});
