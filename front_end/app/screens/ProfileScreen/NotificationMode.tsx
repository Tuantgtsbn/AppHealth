import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import CustomHeader from '@/components/ui/CustomHeader';
import classNames from 'classnames';
export default function NotificationMode() {
    const currentMode = 'silent';
    const listModes = [
        {
            value: 'silent',
            label: 'Yên tĩnh'
        },
        {
            value: 'vibration',
            label: 'Chuông'
        },
        {
            value: 'sound',
            label: 'Âm thanh'
        }
    ];
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
                                className={classNames(
                                    'w-[30px] h-[30px] rounded-full border-2',
                                    {
                                        'bg-blue-500':
                                            currentMode === item.value
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
