import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator
} from 'react-native';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@config/firebase';
import { clearCredentials, setCredentials } from '@/redux/authSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Welcome({ navigation }) {
    const { isAuthenticated, loading } = useSelector(
        (state: RootState) => state.auth
    );
    console.log('isAuthenticated', isAuthenticated);
    console.log('loading', loading);
    const dispatch = useDispatch();
    useEffect(() => {
        if (isAuthenticated && !loading) {
            navigation.replace('MainApp', { screen: 'Home' });
        }
    }, [isAuthenticated]);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                await AsyncStorage.setItem(
                    'user',
                    JSON.stringify(firebaseUser)
                );

                dispatch(setCredentials(firebaseUser));
                navigation.replace('MainApp', {
                    screen: 'Home'
                });
            } else {
                await AsyncStorage.removeItem('user');
                dispatch(clearCredentials());
            }
        });
        (async () => {
            const user = await AsyncStorage.getItem('user');
            if (user) {
                dispatch(setCredentials(JSON.parse(user)));
            } else {
                dispatch(clearCredentials());
            }
        })();
    }, []);
    return (
        <View className='flex-1 px-[30px] justify-center items-center gap-[30px]'>
            <Text className='text-[30px] font-bold text-center w-[160px]'>
                Welcome to Heart Rate
            </Text>
            <Image source={require('@assets/images/welcome.png')} />
            <TouchableOpacity className='w-full flex flex-row gap-2 bg-primary p-4 rounded-full justify-center items-center'>
                <Text
                    // disabled={loading}
                    className='text-center text-white font-semibold text-[23px] uppercase'
                    onPress={() => navigation.navigate('Login')}
                >
                    Continue
                </Text>
                {loading && <ActivityIndicator size='small' color='white' />}
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
