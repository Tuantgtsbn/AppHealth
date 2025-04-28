import React, { useCallback, useState } from 'react';
import AppNavigator from './router/AppNavigation';
import '../global.css';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import { View } from 'react-native';
import { NetworkProvider } from './context/NetWorkContext';
export default function Index() {
    const [appIsReady, setAppIsReady] = useState(false);
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);
    // if (!appIsReady) {
    //     return null;
    // }
    return (
        <>
            <NetworkProvider>
                <View style={{ flex: 1 }} onLayout={onLayoutRootView}>
                    <Provider store={store}>
                        <AppNavigator />
                    </Provider>
                    <Toast />
                </View>
            </NetworkProvider>
        </>
    );
}
