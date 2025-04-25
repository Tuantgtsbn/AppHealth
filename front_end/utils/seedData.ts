import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import fs from 'fs';

// function readJSONFile(filePath) {
//     try {
//         console.log('hello');
//         const data = fs.readFileSync(filePath, 'utf8'); // đọc file dạng chuỗi
//         const jsonData = JSON.parse(data); // chuyển chuỗi thành object
//         return jsonData;
//     } catch (err) {
//         console.error('Error reading or parsing file:', err);
//         return null;
//     }
// }
// const listData = readJSONFile('./utils/health-sensor-data.json');
// console.log(listData);
const listData = {
    RiskAnalysis: [
        {
            userId: 'jgr8crtfoRSr0ErsJlc75k7g1sl1',
            isStroke: false,
            accuracy: 0.95,
            createdAt: '2025-04-22T08:00:00Z'
        },
        {
            userId: 'jgr8crtfoRSr0ErsJlc75k7g1sl1',
            isStroke: true,
            accuracy: 0.95,
            createdAt: '2025-04-22T09:00:00Z'
        },
        {
            userId: 'jgr8crtfoRSr0ErsJlc75k7g1sl1',
            isStroke: false,
            accuracy: 0.95,
            createdAt: '2025-04-22T10:00:00Z'
        }
    ],
    Notifications: [
        {
            userId: 'jgr8crtfoRSr0ErsJlc75k7g1sl1',
            type: 'health_alert',
            title: 'Cảnh báo sức khỏe',
            message: 'Nhịp tim của bạn cao hơn bình thường',
            status: 1,
            createdAt: '2025-04-22T08:00:00Z'
        },
        {
            userId: 'jgr8crtfoRSr0ErsJlc75k7g1sl1',
            type: 'security',
            title: 'Thay đổi email liên kết cảnh báo',
            message:
                'Bạn đã thay đổi email liên kết từ nguyenminhtuan@gmail.com sang nguyenvana@gmail.com',
            status: 0,
            createdAt: '2025-04-22T09:00:00Z'
        }
    ],
    HistorySendEmails: [
        {
            userId: 'jgr8crtfoRSr0ErsJlc75k7g1sl1',
            email: 'nguyenminhtuan2807203@gmai.com',
            message: 'Báo cáo sức khỏe hàng tuần của bạn',
            createdAt: '2025-04-22T08:00:00Z'
        },
        {
            userId: 'jgr8crtfoRSr0ErsJlc75k7g1sl1',
            email: 'nguyenminhtuan2807203@gmai.com',
            message: 'Báo cáo sức khỏe hàng tuần của bạn',
            createdAt: '2025-04-22T05:00:00Z'
        },
        {
            userId: 'jgr8crtfoRSr0ErsJlc75k7g1sl1',
            email: 'nguyenminhtuan2807203@gmai.com',
            message: 'Báo cáo sức khỏe hàng tuần của bạn',
            createdAt: '2025-04-22T07:00:00Z'
        }
    ]
};

// const listData = readJSONFile('./sampledata.json');

// async function createDataSensors() {
//     const datas = listData['DataSensors'];
//     const ref = collection(db, 'DataSensors');
//     try {
//         for (const data of datas) {
//             await addDoc(ref, data);
//         }
//     } catch (error) {
//         console.log(error);
//     }
// }

async function createRiskAnalysis() {
    const datas = listData['RiskAnalysis'];
    const ref = collection(db, 'RiskAnalysis');
    try {
        for (const data of datas) {
            await addDoc(ref, {
                ...data,
                createdAt: Timestamp.fromDate(new Date(data.createdAt))
            });
        }
    } catch (error) {
        console.log(error);
    }
}

async function createNotifications() {
    const datas = listData['Notifications'];
    const ref = collection(db, 'Notifications');
    try {
        for (const data of datas) {
            await addDoc(ref, {
                ...data,
                createdAt: Timestamp.fromDate(new Date(data.createdAt))
            });
        }
    } catch (error) {
        console.log(error);
    }
}

async function createHistorySendEmails() {
    const datas = listData['HistorySendEmails'];
    const ref = collection(db, 'HistorySendEmails');
    try {
        for (const data of datas) {
            await addDoc(ref, {
                ...data,
                createdAt: Timestamp.fromDate(new Date(data.createdAt))
            });
        }
    } catch (error) {
        console.log(error);
    }
}

const a = Promise.allSettled([
    // createDataSensors(),
    createRiskAnalysis(),
    createNotifications(),
    createHistorySendEmails()
]);
