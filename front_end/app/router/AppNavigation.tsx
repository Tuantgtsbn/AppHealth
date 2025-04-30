import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import BottomTabNavigator from './TabNavigator';
import StackNavigationAuth from '@/(auth)/StackNavigation';
// import modelService from '../services/modelService';

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator id={'AppNavigator'} initialRouteName='Auth'>
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
