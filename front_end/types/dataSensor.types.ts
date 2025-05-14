import { Timestamp } from 'firebase/firestore';

type DataSensor = {
    userId: string;
    sensorId: string;
    createdAt: Timestamp;
    heartRate: number;
    spo2: number;
    isStroke?: boolean;
    accuracy?: number;
};

export default DataSensor;
