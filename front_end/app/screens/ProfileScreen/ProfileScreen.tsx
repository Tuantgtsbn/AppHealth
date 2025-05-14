import Card from '@/components/ui/Card';
import AntDesign from '@expo/vector-icons/AntDesign';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import React, { useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Image,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { signOut } from '@/redux/authSlice';
const ProfileScreen = ({ navigation }) => {
    const dispatch = useDispatch();
    const { loading } = useSelector((state: RootState) => state.auth);
    const { dateOfBirth, weight, height, nameDisplay, email, avatar } =
        useSelector((state: RootState) => state.user.detailUser);

    const dataMetrics = [
        {
            name: 'Chiều cao',
            value: height ? height.value + ' ' + height.unit : '0 cm'
        },
        {
            name: 'Cân nặng',
            value: weight ? weight.value + ' ' + weight.unit : '0 kg'
        },
        {
            name: 'Tuổi',
            value:
                new Date().getFullYear() -
                    new Date(dateOfBirth).getFullYear() || 1
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
    const handleNavigateManageThreshold = () => {
        navigation.navigate('ManageThreshold');
    };
    const handleLogout = async () => {
        try {
            await dispatch(signOut()).unwrap();
            navigation.replace('Auth');
        } catch (error) {
            console.log(error);
        }
    };
    return (
        <ScrollView className='flex-1 px-[30px] bg-white'>
            <Text className='font-bold text-3xl text-center mt-[10px]'>
                Hồ sơ cá nhân
            </Text>
            <View className='flex-row justify-between items-center mt-[35px]'>
                <View className='flex-row gap-3'>
                    <View className='w-[40px] h-[40px] bg-gray-300 rounded-full justify-center items-center'>
                        <Image
                            source={{ uri: avatar }}
                            className='w-full h-full rounded-full'
                        />
                    </View>
                    <View>
                        <Text className='font-semibold'>{nameDisplay}</Text>
                        <Text className='text-[10px]'>{email}</Text>
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
                        onPress={handleNavigateManageThreshold}
                    >
                        <View className='flex-row justify-between'>
                            <View className='flex-row gap-2'>
                                <MaterialCommunityIcons
                                    name='hospital-box-outline'
                                    size={24}
                                    color='black'
                                />
                                <Text>Ngưỡng cảnh báo</Text>
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
            <View className='my-[35px]'>
                <Card>
                    <Text className='font-bold text-xl'>Đăng xuất</Text>
                    <TouchableOpacity
                        className='mt-[10px]'
                        onPress={handleLogout}
                    >
                        <View className='flex-row justify-between'>
                            <View className='flex-row gap-2'>
                                <MaterialCommunityIcons
                                    name='logout'
                                    size={24}
                                    color='black'
                                />
                                <Text>Đăng xuất</Text>
                            </View>
                            {loading && (
                                <ActivityIndicator
                                    size={'small'}
                                    color={'gray'}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                </Card>
            </View>
        </ScrollView>
    );
};

export default ProfileScreen;
