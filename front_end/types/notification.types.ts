import { Timestamp } from 'firebase/firestore';
type Threshold = {
    min: number;
    max: number;
};
export type NotificationData = {
    userId: string;
    type: string;
    title: string;
    message: string;
    status: number;
    createdAt: Timestamp;
    threshold?: Threshold;
    value?: number;
    metricType?: string;
};
