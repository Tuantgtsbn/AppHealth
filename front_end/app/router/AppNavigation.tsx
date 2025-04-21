import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BottomTabNavigator from './TabNavigator';
import Welcome from '@/(auth)/onboarding/Welcome';
import StackNavigationAuth from '@/(auth)/StackNavigation';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName='Auth'>
            <Stack.Screen
                name='Auth'
                component={StackNavigationAuth}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name='MainApp'
                component={BottomTabNavigator}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default AppNavigator;
