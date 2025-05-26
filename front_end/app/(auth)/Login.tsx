import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import Fontisto from '@expo/vector-icons/Fontisto';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { signInWithEmailPassword } from '@/redux/authSlice';
import * as yup from 'yup';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Toast from 'react-native-toast-message';
import { RootState } from '@/redux/store';
const schema = yup.object().shape({
    email: yup
        .string()
        .required('Vui lòng nhập email')
        .email('Email không hợp lệ'),
    password: yup
        .string()
        .required('Vui lòng nhập mật khẩu')
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
});

type FormData = yup.InferType<typeof schema>;
const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isShowPassword, setIsShowPassword] = useState(false);
    const { loading } = useSelector((state: RootState) => state.auth);
    console.log(navigation);
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
            password: ''
        }
    });
    const onSubmit = async (data: FormData) => {
        try {
            await dispatch(signInWithEmailPassword(data)).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Đăng nhập thành công'
            });
            navigation.replace('MainApp', { screen: 'Home' });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error
            });
        }
    };
    const dispatch = useDispatch();
    const handleRegister = () => {
        navigation.navigate('Register');
    };

    return (
        <View className='flex-1 justify-between items-center bg-white'>
            <View className='items-center mt-[40px]'>
                <Text className='text-xl'>Thân mến</Text>
                <Text className='text-2xl font-bold w-[160px] text-center'>
                    Chào mừng bạn đã quay lại
                </Text>
                <View className='gap-4 mt-[40px]'>
                    <View className='flex-row gap-2 px-2 py-2 bg-[#F7F8F8] rounded-lg w-90 items-center'>
                        <Fontisto name='email' size={24} color='black' />
                        <Controller
                            control={control}
                            name='email'
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    placeholder='Email'
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType='email-address'
                                    autoCapitalize='none'
                                    className='px-2 py-2 w-80'
                                />
                            )}
                        />
                    </View>
                    {errors.email && (
                        <Text className='text-red-500 ml-2 mt-1'>
                            {errors.email.message}
                        </Text>
                    )}
                    <View className='flex-row gap-2 px-2 py-2 bg-[#F7F8F8] rounded-lg w-90 items-center'>
                        <Feather name='key' size={24} color='black' />
                        <Controller
                            control={control}
                            name='password'
                            render={({ field: { onChange, value } }) => (
                                <TextInput
                                    placeholder='Password'
                                    value={value}
                                    onChangeText={onChange}
                                    secureTextEntry={!isShowPassword}
                                    keyboardType='default'
                                    autoCapitalize='none'
                                    className='px-2 py-2 w-80'
                                />
                            )}
                        />
                        {isShowPassword ? (
                            <Feather
                                name='eye'
                                size={24}
                                color='black'
                                onPress={() =>
                                    setIsShowPassword(!isShowPassword)
                                }
                            />
                        ) : (
                            <Feather
                                name='eye-off'
                                size={24}
                                color='black'
                                onPress={() =>
                                    setIsShowPassword(!isShowPassword)
                                }
                            />
                        )}
                    </View>
                    {errors.password && (
                        <Text className='text-red-500 ml-2 mt-1'>
                            {errors.password.message}
                        </Text>
                    )}
                </View>
                <View className='mt-4'>
                    <Text className='text-center underline'>
                        Quên mật khẩu ?
                    </Text>
                </View>
            </View>

            <View className='mb-[40px]'>
                <View className='w-80'>
                    <TouchableOpacity
                        disabled={loading}
                        className='bg-primary px-2 py-4 rounded-full mt-4 w-full flex-row gap-4 justify-center'
                        onPress={handleSubmit(onSubmit)}
                    >
                        <MaterialIcons name='login' size={24} color='white' />
                        <Text className='text-center text-white font-bold text-xl'>
                            Đăng nhập
                        </Text>
                        {loading && <ActivityIndicator color='white' />}
                    </TouchableOpacity>
                </View>
                <View className='flex-row gap-2 justify-center items-center w-80 mt-6'>
                    <View className='flex-1 h-[1px] bg-gray-400'></View>
                    <Text className=''>Hoặc</Text>
                    <View className='flex-1 h-[1px] bg-gray-400'></View>
                </View>
                <View className='mt-4'>
                    <View className='flex-row gap-20 justify-center'>
                        <TouchableOpacity className='border border-solid border-gray-400 rounded-2xl justify-center items-center p-4'>
                            <Image
                                className='w-[30px] h-[30px]'
                                source={require('@assets/images/google-logo.png')}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity className='border border-solid border-gray-400 rounded-2xl justify-center items-center p-4'>
                            <Image
                                className='w-[30px] h-[30px]'
                                source={require('@assets/images/facebook-logo.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View className='mt-4 flex-row gap-2 justify-center items-center'>
                        <Text className='text-center'>
                            Bạn chưa có tài khoản ?
                        </Text>
                        <TouchableOpacity className='' onPress={handleRegister}>
                            <Text className='text-center underline text-brand'>
                                Đăng ký ngay
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default LoginScreen;
