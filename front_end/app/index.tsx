import React, { useEffect, useState } from 'react';
import AppNavigator from './router/AppNavigation';
import * as tf from '@tensorflow/tfjs';

import loadModel from './services/loadModel';
import makePrediction from './services/makePrediction';

export default function Index() {
    const [model, setModel] = useState<any>(null);

    const userInput = {
        Age: 27,
        Gender: 'Male',
        Region: 'East',
        'Urban/Rural': 'Urban',
        SES: 'Middle',
        'Smoking Status': 'Occasionally',
        'Alcohol Consumption': 'Never',
        'Diet Type': 'Vegetarian',
        'Physical Activity Level': 'Sedentary',
        'Screen Time (hrs/day)': 6,
        'Sleep Duration (hrs/day)': 7,
        'Family History of Heart Disease': 'No',
        Diabetes: 'No',
        Hypertension: 'No',
        'Cholesterol Levels': 137,
        BMI: 19,
        'Stress Level': 'Medium',
        'Blood Pressure': '177.1/90.0',
        'Resting Heart Rate': 106,
        'ECG Results': 'Normal',
        'Chest Pain Type': 'Non-anginal',
        'Maximum Heart Rate Achieved': 188,
        'Exercise Induced Angina': 'No',
        'Blood Oxygen Levels (SpO2%)': 98.4,
        'Triglyceride Levels (mg/dL)': 102
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
