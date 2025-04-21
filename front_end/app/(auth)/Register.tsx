import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Feather from '@expo/vector-icons/Feather';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import Fontisto from '@expo/vector-icons/Fontisto';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { AuthService } from '@services/auth.service';
import * as Google from 'expo-auth-session/providers/google';
import { GoogleAuthProvider } from 'firebase/auth';
const schema = yup.object().shape({
    firstName: yup
        .string()
        .required('Vui lòng nhập họ')
        .min(2, 'Họ phải có ít nhất 2 ký tự'),
    lastName: yup
        .string()
        .required('Vui lòng nhập tên')
        .min(2, 'Tên phải có ít nhất 2 ký tự'),
    email: yup
        .string()
        .required('Vui lòng nhập email')
        .email('Email không hợp lệ'),
    password: yup
        .string()
        .required('Vui lòng nhập mật khẩu')
        .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: yup
        .string()
        .required('Vui lòng xác nhận mật khẩu')
        .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
});

type FormData = yup.InferType<typeof schema>;

const RegisterScreen = ({ navigation }) => {
    const [isShowPassword, setIsShowPassword] = useState(false);
    const [isShowConfirmPassword, setIsShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [request, response, promptAsync] = Google.useAuthRequest({
        expoClientId:
            '922781130321-due6stlhqo23cnh44blvoi6i3scqp6me.apps.googleusercontent.com',
        androidClientId:
            '922781130321-due6stlhqo23cnh44blvoi6i3scqp6me.apps.googleusercontent.com'
    });
    const {
        control,
        handleSubmit,
        formState: { errors }
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: ''
        }
    });

    const handleLogin = () => {
        navigation.replace('Login');
    };
    const handleGoogleSignIn = async () => {
        try {
            setIsLoading(true);
            const result = await promptAsync();

            if (result?.type === 'success') {
                const { id_token } = result.params;
                const credential = GoogleAuthProvider.credential(id_token);
                await AuthService.signInWithGoogleCredential(credential);
                navigation.navigate('CompleteProfile');
            } else {
                throw new Error('Google sign in was cancelled');
            }
        } catch (error: any) {
            Alert.alert(
                'Lỗi đăng nhập',
                error.message || 'Đã có lỗi xảy ra khi đăng nhập bằng Google'
            );
        } finally {
            setIsLoading(false);
        }
    };
    const onSubmit = async (data: FormData) => {
        try {
            setIsLoading(true);
            const credentials = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                password: data.password
            };

            await AuthService.registerWithEmailAndPassword(credentials);
            console.log('Đăng ký thành công');
            Alert.alert('Thành công', 'Đăng ký thành công');
            navigation.navigate('CompleteProfile');
        } catch (error: any) {
            Alert.alert('Lỗi', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View className='flex-1 justify-between items-center bg-white'>
            <View className='items-center mt-[40px]'>
                <Text className='text-xl'>Thân mến</Text>
                <Text className='text-2xl font-bold w-[160px] text-center'>
                    Tạo tài khoản
                </Text>
                <View className='gap-4 mt-[40px]'>
                    <View>
                        <View className='flex-row gap-2 px-2 py-2 bg-[#F7F8F8] rounded-lg w-90 items-center'>
                            <AntDesign name='user' size={24} color='black' />
                            <Controller
                                control={control}
                                name='firstName'
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        placeholder='First Name'
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType='default'
                                        autoCapitalize='none'
                                        className='px-2 py-2 w-80'
                                    />
                                )}
                            />
                        </View>
                        {errors.firstName && (
                            <Text className='text-red-500 ml-2 mt-1'>
                                {errors.firstName.message}
                            </Text>
                        )}
                    </View>

                    <View>
                        <View className='flex-row gap-2 px-2 py-2 bg-[#F7F8F8] rounded-lg w-90 items-center'>
                            <AntDesign name='user' size={24} color='black' />
                            <Controller
                                control={control}
                                name='lastName'
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        placeholder='Last name'
                                        value={value}
                                        onChangeText={onChange}
                                        keyboardType='default'
                                        autoCapitalize='none'
                                        className='px-2 py-2 w-80'
                                    />
                                )}
                            />
                        </View>
                        {errors.lastName && (
                            <Text className='text-red-500 ml-2 mt-1'>
                                {errors.lastName.message}
                            </Text>
                        )}
                    </View>

                    <View>
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
                    </View>

                    <View>
                        <View className='flex-row gap-2 px-2 py-2 bg-[#F7F8F8] rounded-lg w-90 items-center'>
                            <AntDesign name='lock' size={24} color='black' />
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
                            <TouchableOpacity
                                onPress={() =>
                                    setIsShowPassword(!isShowPassword)
                                }
                            >
                                <Feather
                                    name={isShowPassword ? 'eye' : 'eye-off'}
                                    size={24}
                                    color='black'
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.password && (
                            <Text className='text-red-500 ml-2 mt-1'>
                                {errors.password.message}
                            </Text>
                        )}
                    </View>

                    <View>
                        <View className='flex-row gap-2 px-2 py-2 bg-[#F7F8F8] rounded-lg w-90 items-center'>
                            <AntDesign name='lock' size={24} color='black' />
                            <Controller
                                control={control}
                                name='confirmPassword'
                                render={({ field: { onChange, value } }) => (
                                    <TextInput
                                        placeholder='Confirm Password'
                                        value={value}
                                        onChangeText={onChange}
                                        secureTextEntry={!isShowConfirmPassword}
                                        keyboardType='default'
                                        autoCapitalize='none'
                                        className='px-2 py-2 w-80'
                                    />
                                )}
                            />
                            <TouchableOpacity
                                onPress={() =>
                                    setIsShowConfirmPassword(
                                        !isShowConfirmPassword
                                    )
                                }
                            >
                                <Feather
                                    name={
                                        isShowConfirmPassword
                                            ? 'eye'
                                            : 'eye-off'
                                    }
                                    size={24}
                                    color='black'
                                />
                            </TouchableOpacity>
                        </View>
                        {errors.confirmPassword && (
                            <Text className='text-red-500 ml-2 mt-1'>
                                {errors.confirmPassword.message}
                            </Text>
                        )}
                    </View>
                </View>
                <View className='mt-4'>
                    <Text className='text-center w-80'>
                        Bạn sẽ phải chấp nhận{' '}
                        <Text className='text-underlined text-primary'>
                            điều khoản
                        </Text>{' '}
                        và{' '}
                        <Text className='text-underlined text-primary'>
                            chính sách
                        </Text>{' '}
                        của chúng tôi
                    </Text>
                </View>
            </View>

            <View className='mb-[40px]'>
                <View className='w-80'>
                    <TouchableOpacity
                        className='bg-primary px-2 py-4 rounded-full mt-4 w-full flex-row gap-4 justify-center'
                        onPress={handleSubmit(onSubmit)}
                    >
                        <MaterialIcons name='login' size={24} color='white' />
                        <Text className='text-center text-white font-bold text-xl'>
                            Đăng ký
                        </Text>
                        {isLoading && <ActivityIndicator color='white' />}
                    </TouchableOpacity>
                </View>
                <View className='flex-row gap-2 justify-center items-center w-80 mt-6'>
                    <View className='flex-1 h-[1px] bg-gray-400'></View>
                    <Text className=''>Hoặc</Text>
                    <View className='flex-1 h-[1px] bg-gray-400'></View>
                </View>
                <View className='mt-4'>
                    <View className='flex-row gap-20 justify-center'>
                        <TouchableOpacity
                            className='border border-solid border-gray-400 rounded-2xl justify-center items-center p-4'
                            onPress={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            <Image
                                className='w-[30px] h-[30px]'
                                source={require('@assets/images/google-logo.png')}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            className='border border-solid border-gray-400 rounded-2xl justify-center items-center p-4'
                            onPress={() => AuthService.signInWithFacebook()}
                        >
                            <Image
                                className='w-[30px] h-[30px]'
                                source={require('@assets/images/facebook-logo.png')}
                            />
                        </TouchableOpacity>
                    </View>
                    <View className='mt-4 flex-row gap-2 justify-center items-center'>
                        <Text className='text-center'>
                            Bạn đã có tài khoản ?
                        </Text>
                        <TouchableOpacity onPress={handleLogin}>
                            <Text className='text-center underline text-brand'>
                                Đăng nhập ngay
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default RegisterScreen;
