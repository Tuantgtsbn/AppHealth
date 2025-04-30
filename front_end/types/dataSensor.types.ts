import { Timestamp } from 'firebase/firestore';

type DataSensor = {
    userId: string;
    sensorId: string;
    createdAt: Timestamp;
    heartRate: number;
    spo2: number;
};

export default DataSensor;
