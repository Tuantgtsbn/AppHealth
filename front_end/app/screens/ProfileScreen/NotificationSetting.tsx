import { View, Text, TouchableOpacity } from 'react-native';
import React from 'react';
import CustomHeader from '@/components/ui/CustomHeader';
import Card from '@/components/ui/Card';
import { Feather, Fontisto, MaterialIcons } from '@expo/vector-icons';

export default function NotificationSetting({ navigation }) {
    return (
        <View className='flex-1 bg-white'>
            <View className='mt-[16px]'>
                <CustomHeader title='Cài đặt thông báo' />
            </View>
            <View className='mt-[35px] px-[30px]'>
                <Card>
                    <View className='gap-3'>
                        <TouchableOpacity
                            className='mt-[10px]'
                            onPress={() =>
                                navigation.navigate('ListRegisterEmail')
                            }
                        >
                            <View className='flex-row justify-between'>
                                <View className='flex-row gap-2'>
                                    <Fontisto
                                        name='email'
                                        size={24}
                                        color='black'
                                    />
                                    <Text className='font-bold'>
                                        Email gửi cảnh báo
                                    </Text>
                                </View>
                                <MaterialIcons
                                    name='navigate-next'
                                    size={24}
                                    color='black'
                                />
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='mt-[10px]'
                            onPress={() =>
                                navigation.navigate('NotificationMode')
                            }
                        >
                            <View className='flex-row justify-between'>
                                <View className='flex-row gap-2'>
                                    <Feather
                                        name='bell'
                                        size={24}
                                        color='black'
                                    />
                                    <Text className='font-bold'>
                                        Chế độ thông báo
                                    </Text>
                                </View>
                                <MaterialIcons
                                    name='navigate-next'
                                    size={24}
                                    color='black'
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                </Card>
            </View>
        </View>
    );
}
