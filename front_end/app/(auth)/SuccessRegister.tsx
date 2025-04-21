import { Image, Text, TouchableOpacity, View } from 'react-native';
import React, { Component } from 'react';

const SuccessRegister = ({ navigation }: any) => {
    return (
        <View className='flex-1 items-center justify-between bg-white'>
            <View className='items-center mt-[40px]'>
                <Image source={require('@assets/images/SuccessRegister.png')} />
                <View className='gap-3 mt-[40px]'>
                    <Text className='font-bold text-2xl text-center'>
                        Chào mừng, Stefani
                    </Text>
                    <Text className='text-center'>
                        Bạn đã hoàn thành xong cài đặt
                    </Text>
                    <Text className='text-center'>Hãy bắt đầu ngay thôi!</Text>
                </View>
            </View>
            <TouchableOpacity
                onPress={() =>
                    navigation.replace('MainApp', { screen: 'Home' })
                }
                className='bg-primary mb-[40px]  rounded-full w-[90%] py-4 mt-8 flex-row gap-1 items-center justify-center'
            >
                <Text className='text-white text-center font-2xl font-bold'>
                    Đi tới trang chủ
                </Text>
            </TouchableOpacity>
        </View>
    );
};
export default SuccessRegister;
