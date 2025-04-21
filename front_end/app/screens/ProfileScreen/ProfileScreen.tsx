import Card from '@/components/ui/Card';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ProfileScreen = ({ navigation }) => {
    const dataMetrics = [
        {
            name: 'Chiều cao',
            value: '160cm'
        },
        {
            name: 'Cân nặng',
            value: '50kg'
        },
        {
            name: 'Tuổi',
            value: '22'
        }
    ];
    const handleNavigateEditProfile = () => {
        navigation.navigate('EditProfile');
    };
    const handleNavigateManageDevices = () => {
        navigation.navigate('ManageDevices');
    };
    const handleNavigateNotificationSetting = () => {
        navigation.navigate('NotificationSetting');
    };
    return (
        <View className='flex-1 px-[30px] bg-white'>
            <Text className='font-bold text-3xl text-center'>
                Hồ sơ cá nhân
            </Text>
            <View className='flex-row justify-between items-center mt-[35px]'>
                <View className='flex-row gap-3'>
                    <View className='w-[40px] h-[40px] bg-gray-300 rounded-full justify-center items-center'>
                        <AntDesign name='user' size={24} color='black' />
                    </View>
                    <View>
                        <Text className='font-semibold'>Stefani Wong</Text>
                        <Text>Lose a Fat Program</Text>
                    </View>
                </View>
                <View>
                    <TouchableOpacity
                        className='px-4 py-2 w-[100px] rounded-full bg-primary'
                        onPress={handleNavigateEditProfile}
                    >
                        <Text className='text-white text-center font-bold'>
                            Chỉnh sửa
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View className='flex-row flex-wrap justify-between gap-4 mt-[35px]'>
                {dataMetrics.map((item, index) => (
                    <Card
                        className='w-[100px] py-3 justify-between items-center'
                        key={index}
                    >
                        <Text className='font-bold font-primary'>
                            {item.value}
                        </Text>
                        <Text>{item.name}</Text>
                    </Card>
                ))}
            </View>
            <View className='mt-[35px]'>
                <Card>
                    <Text className='font-bold text-xl'>Thiết bị</Text>
                    <TouchableOpacity
                        className='mt-[10px]'
                        onPress={handleNavigateManageDevices}
                    >
                        <View className='flex-row justify-between'>
                            <View className='flex-row gap-2'>
                                <MaterialIcons
                                    name='bluetooth-connected'
                                    size={24}
                                    color='black'
                                />
                                <Text>Quản lý các thiết bị kết nối</Text>
                            </View>
                            <MaterialIcons
                                name='navigate-next'
                                size={24}
                                color='black'
                            />
                        </View>
                    </TouchableOpacity>
                </Card>
            </View>
            <View className='mt-[35px]'>
                <Card>
                    <Text className='font-bold text-xl'>Thông báo</Text>
                    <TouchableOpacity
                        className='mt-[10px]'
                        onPress={handleNavigateNotificationSetting}
                    >
                        <View className='flex-row justify-between'>
                            <View className='flex-row gap-2'>
                                <Feather name='bell' size={24} color='black' />
                                <Text>Cài đặt thông báo</Text>
                            </View>
                            <MaterialIcons
                                name='navigate-next'
                                size={24}
                                color='black'
                            />
                        </View>
                    </TouchableOpacity>
                </Card>
            </View>
        </View>
    );
};

export default ProfileScreen;
