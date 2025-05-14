import React, { useCallback, useEffect, useState } from 'react';
import AppNavigator from './router/AppNavigation';
import '../global.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { NetworkProvider } from './context/NetWorkContext';
import modelService from '../ServicesAI/modelService';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';

// Giữ màn hình splash hiển thị cho đến khi ứng dụng sẵn sàng
SplashScreen.preventAutoHideAsync();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Tải mô hình trong try-catch để xử lý lỗi
                await modelService.initModel().catch((error) => {
                    console.warn(
                        'Model loading error, continuing without model:',
                        error
                    );
                });

                // Đánh dấu ứng dụng đã sẵn sàng ngay cả khi mô hình không tải được
                setAppIsReady(true);
            } catch (error) {
                console.warn('Error during app preparation:', error);
                // Vẫn đánh dấu ứng dụng đã sẵn sàng để tránh bị treo
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null;
    }

    return (
        <>
            <NetworkProvider>
                <View onLayout={onLayoutRootView} style={{ flex: 1 }}>
                    <Provider store={store}>
                        <SafeAreaProvider>
                            <AppNavigator />
                        </SafeAreaProvider>
                    </Provider>
                </View>
                <Toast />
            </NetworkProvider>
        </>
    );
}
