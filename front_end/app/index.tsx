import React, { useEffect, useState } from 'react';
import AppNavigator from './router/AppNavigation';
import * as tf from '@tensorflow/tfjs';

import loadModel from './services/loadModel';
import makePrediction from './services/makePrediction';

export default function Index() {
    const [model, setModel] = useState<any>(null);

    const userInput = {
        Age: 24,
        Gender: 'Female',
        Region: 'North',
        'Urban/Rural': 'Urban',
        SES: 'Low',
        'Smoking Status': 'Occasionally',
        'Alcohol Consumption': 'Occasionally',
        'Diet Type': 'Vegan',
        'Physical Activity Level': 'High',
        'Screen Time (hrs/day)': 15,
        'Sleep Duration (hrs/day)': 9,
        'Family History of Heart Disease': 'Yes',
        Diabetes: 'Yes',
        Hypertension: 'No',
        'Cholesterol Levels': 256,
        BMI: 33.9,
        'Stress Level': 'Low',
        'Blood Pressure': '138.3/76.6',
        'Resting Heart Rate': 86,
        'ECG Results': 'Normal',
        'Chest Pain Type': 'Typical',
        'Maximum Heart Rate Achieved': 164,
        'Exercise Induced Angina': 'No',
        'Blood Oxygen Levels (SpO2%)': 92.7,
        'Triglyceride Levels (mg/dL)': 374
    };

    useEffect(() => {
        const fetchModel = async () => {
            try {
                await tf.setBackend('cpu');
                await tf.ready();
                const loadedModel = await loadModel();

                setModel(loadedModel);
            } catch (err) {
                console.log('Không thể tải mô hình.');
            }
        };

        fetchModel();
    }, []);

    useEffect(() => {
        makePrediction(model, userInput);
    }, [model]);

    return <AppNavigator />;
}
