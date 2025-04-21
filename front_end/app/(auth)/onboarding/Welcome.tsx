import { View, Text, Image, TouchableOpacity } from 'react-native';
import React from 'react';

export default function Welcome({ navigation }) {
    return (
        <View className='flex-1 px-[30px] justify-center items-center gap-[30px]'>
            <Text className='text-[30px] font-bold text-center w-[160px]'>
                Welcome to Heart Rate
            </Text>
            <Image source={require('@assets/images/welcome.png')} />
            <TouchableOpacity className='w-full bg-primary p-4 rounded-full'>
                <Text
                    className='text-center text-white font-semibold text-[23px] uppercase'
                    onPress={() => navigation.navigate('Login')}
                >
                    Continue
                </Text>
            </TouchableOpacity>
            <Text className='text-center'>
                By continuing, you agree to our{' '}
                <Text className='underline text-primary'>Terms of Service</Text>{' '}
                and{' '}
                <Text className='underline text-primary'>Privacy Policy</Text>
            </Text>
        </View>
    );
}
