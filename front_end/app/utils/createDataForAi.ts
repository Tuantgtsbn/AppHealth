type inputData = {
    Age: number;
    Gender: string;
    Diabetes: string;
    Hypertension: string;
    BMI: number;
    'Resting Heart Rate': number;
    'Blood Oxygen Levels (SpO2%)': number;
};
export const createDataForAi = (data: inputData) => {
    return {
        ...data,
        Region: 'North',
        'Urban/Rural': 'Urban',
        SES: 'Middle',
        'Smoking Status': 'Never',
        'Diet Type': 'Non-Vegetarian',
        'Physical Activity Level': 'Moderate',
        'Family History of Heart Disease': 'No',
        'Stress Level': 'Medium',
        'ECG Results': 'Normal',
        'Chest Pain Type': 'Non-anginal',
        'Maximum Heart Rate Achieved': 150,
        'Exercise Induced Angina': 'No',
        'Triglyceride Levels (mg/dL)': 100,
        'Cholesterol Levels': 150,
        'Screen Time (hrs/day)': 2,
        'Sleep Duration (hrs/day)': 8,
        'Alcohol Consumption': 'Never',
        'Blood Pressure': '177.1/90.0'
    };
};
