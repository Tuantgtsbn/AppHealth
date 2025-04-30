import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import CustomHeader from '@/components/ui/CustomHeader';
import classNames from 'classnames';
import {
    NotificationMode,
    setNotificationMode
} from '@/utils/notificationSettings';
import Toast from 'react-native-toast-message';
import { useNotification } from '@hooks/useNotification';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { updateUserProfile } from '@/redux/userSlice';
import { auth } from '@config/firebase';
export default function NotificationSettingMode() {
    const { soundAlerts } = useSelector(
        (state: RootState) => state.user?.detailUser
    );
    const id = auth.currentUser.uid;
    const dispatch = useDispatch();
    const listModes = [
        {
            value: 'silent',
            label: 'Yên tĩnh'
        },
        {
            value: 'vibration',
            label: 'Rung'
        },
        {
            value: 'sound',
            label: 'Âm thanh'
        }
    ];

    const previewNotification = async (mode: NotificationMode) => {
        switch (mode) {
            case 'vibration':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                // Thêm một rung phụ sau 100ms để tạo hiệu ứng rung kép
                setTimeout(async () => {
                    await Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Heavy
                    );
                }, 100);
                break;
            case 'sound':
                const { sound } = await Audio.Sound.createAsync(
                    require('@assets/sounds/notifications.wav')
                );
                await sound.playAsync();
                break;
            default:
                // Silent mode - do nothing
                break;
        }
    };

    const handleModeChange = async (mode: NotificationMode) => {
        try {
            // Preview the notification first
            await previewNotification(mode);

            // Then update the mode
            await dispatch(
                updateUserProfile({ id, profileData: { soundAlerts: mode } })
            ).unwrap();
            await setNotificationMode(mode);
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Cập nhật chế độ thông báo thành công'
            });
        } catch (error: any) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Đã có lỗi xảy ra khi cập nhật chế độ thông báo'
            });
        }
    };

    return (
        <View className='flex-1 bg-white'>
            <View className='mt-[16px]'>
                <CustomHeader title='Chế độ thông báo' />
                <View className='mt-[35px] px-[30px]'>
                    {listModes.map((item, index) => (
                        <View
                            className='flex-row justify-between items-center my-[10px]'
                            key={index}
                        >
                            <Text className='text-bold text-xl'>
                                {item.label}
                            </Text>
                            <TouchableOpacity
                                onPress={() =>
                                    handleModeChange(
                                        item.value as NotificationMode
                                    )
                                }
                                className={classNames(
                                    'w-[30px] h-[30px] rounded-full border-2',
                                    {
                                        'bg-blue-500':
                                            soundAlerts === item.value
                                    }
                                )}
                            ></TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
}
