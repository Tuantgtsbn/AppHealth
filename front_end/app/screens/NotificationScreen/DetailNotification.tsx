import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StatusBar,
    Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useFocusEffect } from '@react-navigation/native';
import { getDetailNoti } from '@/redux/notificationSlice';
import Toast from 'react-native-toast-message';
import CustomHeader from '@/components/ui/CustomHeader';

const DetailNotification = ({ route, navigation }) => {
    //   const { notificationId, notificationType, notificationValue, threshold } = route.params;
    const dispatch = useDispatch();
    const { detailNotification, loadingDetail: loading } = useSelector(
        (state: RootState) => state.notification
    );
    useEffect(() => {
        async function fetchDetailNoti() {
            try {
                await dispatch(getDetailNoti(route.params.id)).unwrap();
            } catch (error) {
                Toast.show({
                    type: 'error',
                    text1: 'Lỗi',
                    text2: error
                });
            }
        }
        fetchDetailNoti();
    }, [route.params.id]);

    //Tạo lời khuyên y học dựa trên loại thông báo và giá trị
    const getMedicalAdvice = (detailNotification) => {
        const isHeartRate = detailNotification.metricType.includes('heartRate');
        const { value, threshold } = detailNotification;

        if (isHeartRate) {
            if (Number(value) > (threshold?.max || 100)) {
                return [
                    'Nghỉ ngơi và thư giãn trong vài phút',
                    'Thực hiện hít thở sâu và chậm',
                    'Uống một cốc nước',
                    'Tránh caffeine và đồ uống có cồn',
                    'Nếu nhịp tim vẫn cao hoặc kèm theo triệu chứng khác như đau ngực, khó thở, chóng mặt, hãy liên hệ bác sĩ ngay lập tức'
                ];
            } else if (value < (threshold?.min || 60)) {
                return [
                    'Ngồi hoặc nằm xuống nếu cảm thấy chóng mặt',
                    'Uống nước để tránh mất nước',
                    'Kiểm tra nếu bạn đang dùng thuốc có thể ảnh hưởng đến nhịp tim',
                    'Tránh thay đổi tư thế đột ngột',
                    'Nếu nhịp tim thấp kèm theo triệu chứng như chóng mặt, mệt mỏi, ngất xỉu, hãy liên hệ bác sĩ ngay lập tức'
                ];
            }
        } else {
            // Lời khuyên cho SpO2 thấp
            return [
                'Ngồi thẳng lưng hoặc đứng dậy để tăng dung tích phổi',
                'Thực hiện các bài tập hít thở sâu',
                'Đảm bảo môi trường có đủ không khí trong lành',
                'Tránh môi trường ô nhiễm hoặc có khói',
                'Nếu mức SpO2 tiếp tục dưới 92% hoặc bạn gặp khó thở, hãy liên hệ bác sĩ ngay lập tức',
                'Đối với người mắc các bệnh về phổi hoặc tim, hãy tuân theo hướng dẫn y tế đặc biệt của bác sĩ'
            ];
        }
    };

    const renderAdviceItems = (advices) => {
        return advices.map((advice, index) => (
            <View key={index} style={styles.adviceItem}>
                <View style={styles.bulletPoint}>
                    <Text style={styles.bulletPointText}>{index + 1}</Text>
                </View>
                <Text style={styles.adviceText}>{advice}</Text>
            </View>
        ));
    };

    const STATUSBAR_HEIGHT =
        Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24;

    return (
        <View style={styles.container}>
            <CustomHeader title='Chi tiết cảnh báo' />

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color='#FF4757' />
                    <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.contentContainer}
                >
                    {detailNotification ? (
                        <View style={styles.alertCard}>
                            <Text className='font-bold text-2xl'>
                                {detailNotification?.title}
                            </Text>
                            <Text className='text-gray-400'>
                                {detailNotification?.createdAt
                                    .toDate()
                                    .toLocaleString('vi-VN')}
                            </Text>
                            <View className='flex-row gap-1'>
                                <Text className='font-bold'>Nội dung:</Text>
                                <Text>{detailNotification?.message}</Text>
                            </View>
                            {detailNotification.type === 'health_alert' && (
                                <View>
                                    <Text className='font-bold text-xl'>
                                        Lời khuyên dành cho bạn:
                                    </Text>
                                    {renderAdviceItems(
                                        getMedicalAdvice(detailNotification)
                                    )}
                                </View>
                            )}
                        </View>
                    ) : (
                        <Text className='text-center'>
                            Không có thông báo nào
                        </Text>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff'
    },
    //   statusBarSpacer: {
    //     height: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
    //     backgroundColor: '#f5f5f5',
    //   },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#e0e0e0',
        elevation: 33,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2
    },
    backButton: {
        padding: 8
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold'
    },
    headerRight: {
        width: 40 // Để cân bằng với nút back ở bên trái
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#666'
    },
    content: {
        flex: 1
    },
    contentContainer: {
        padding: 16
    },
    alertCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginBottom: 20
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#f8f8f8',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16
    },
    alertTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center'
    },
    valueContainer: {
        alignItems: 'center',
        width: '100%'
    },
    valueText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FF4757',
        marginBottom: 8
    },
    thresholdText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 8
    },
    timestampText: {
        fontSize: 14,
        color: '#888',
        marginTop: 8
    },
    adviceSection: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    adviceSectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16
    },
    adviceList: {
        marginBottom: 16
    },
    adviceItem: {
        flexDirection: 'row',
        marginVertical: 12,
        alignItems: 'flex-start'
    },
    bulletPoint: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FF4757',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
        marginTop: 2
    },
    bulletPointText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12
    },
    adviceText: {
        flex: 1,
        fontSize: 16,
        lineHeight: 24
    },
    disclaimer: {
        flexDirection: 'row',
        backgroundColor: '#FFF5F5',
        padding: 12,
        borderRadius: 8,
        alignItems: 'flex-start'
    },
    disclaimerText: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#666',
        lineHeight: 20
    }
});

export default DetailNotification;
