import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity
} from 'react-native';
import React from 'react';
import CustomHeader from '@/components/ui/CustomHeader';
import Card from '@/components/ui/Card';
import { useDispatch, useSelector } from 'react-redux';
import { updateUserProfile } from '@/redux/userSlice';
import Toast from 'react-native-toast-message';

export default function ManageThreshold() {
    const { heartRateThreshold, spo2Threshold } = useSelector(
        (state) => state.user?.detailUser
    );
    const dispatch = useDispatch();
    const { loading } = useSelector((state) => state.user);
    const { uid: id } = useSelector((state) => state.auth?.user);
    const [newHeartRateThreshold, setNewHeartRateThreshold] = React.useState({
        min: String(heartRateThreshold?.min) || '',
        max: String(heartRateThreshold?.max) || ''
    });
    const [newSpo2Threshold, setNewSpo2Threshold] = React.useState({
        min: String(spo2Threshold?.min) || '',
        max: String(spo2Threshold?.max) || ''
    });
    const handleUpdateThreshold = async () => {
        try {
            await dispatch(
                updateUserProfile({
                    id,
                    profileData: {
                        heartRateThreshold: {
                            min: newHeartRateThreshold.min
                                ? Number(newHeartRateThreshold.min)
                                : 60,
                            max: newHeartRateThreshold.max
                                ? Number(newHeartRateThreshold.max)
                                : 100
                        },
                        spo2Threshold: {
                            min: newSpo2Threshold.min
                                ? Number(newSpo2Threshold.min)
                                : 95,
                            max: newSpo2Threshold.max
                                ? Math.min(Number(newSpo2Threshold.max), 100)
                                : 100
                        }
                    }
                })
            ).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Cập nhật ngưỡng cảnh báo thành công'
            });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error
            });
        }
    };
    return (
        <SafeAreaView className='flex-1 bg-white'>
            <CustomHeader title='Ngưỡng cảnh báo' />
            <View className='px-[30px]'>
                <Card className='mt-[35px]'>
                    <Text className='font-bold text-xl'>Nhịp tim</Text>
                    <Text>Ngưỡng dưới</Text>
                    <TextInput
                        className='border border-gray-300 rounded-md px-[10px] py-[13px] text-xl'
                        value={newHeartRateThreshold.min}
                        onChangeText={(text) =>
                            setNewHeartRateThreshold({
                                ...newHeartRateThreshold,
                                min: text
                            })
                        }
                    />
                    <Text>Ngưỡng trên</Text>
                    <TextInput
                        className='border border-gray-300 rounded-md px-[10px] py-[13px] text-xl'
                        value={newHeartRateThreshold.max}
                        onChangeText={(text) =>
                            setNewHeartRateThreshold({
                                ...newHeartRateThreshold,
                                max: text
                            })
                        }
                    />
                </Card>
                <Card className='mt-[35px]'>
                    <Text className='font-bold text-xl'>SpO2</Text>
                    <Text>Ngưỡng dưới</Text>
                    <TextInput
                        className='border border-gray-300 rounded-md px-[10px] py-[13px] text-xl'
                        value={newSpo2Threshold.min}
                        onChangeText={(text) =>
                            setNewSpo2Threshold({
                                ...newSpo2Threshold,
                                min: text
                            })
                        }
                    />
                    <Text>Ngưỡng trên</Text>
                    <TextInput
                        className='border border-gray-300 rounded-md px-[10px] py-[13px] text-xl'
                        value={newSpo2Threshold.max}
                        onChangeText={(text) =>
                            setNewSpo2Threshold({
                                ...newSpo2Threshold,
                                max: text
                            })
                        }
                    />
                </Card>
                <View className='mt-[35px]'>
                    <TouchableOpacity
                        onPress={handleUpdateThreshold}
                        className='items-center py-3 justify-center rounded-lg bg-primary'
                    >
                        <Text className='text-white'>Lưu</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}
