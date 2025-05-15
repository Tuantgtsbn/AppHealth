import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen/HomeScreen';

import ProfileStack from '@/screens/ProfileScreen/Layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AnalyticsScreen from '../screens/AnalyticsScreen/AnalyticsScreen';
import NotificationStack from '@/screens/NotificationScreen/Layout';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route, navigation }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'ProfileScreenStack') {
                        iconName = focused ? 'person' : 'person-outline';
                    } else if (route.name === 'Analytics') {
                        iconName = focused ? 'analytics' : 'analytics-outline';
                    } else if (route.name === 'Notifications') {
                        iconName = focused ? 'bell' : 'bell-outline';
                        return (
                            <MaterialCommunityIcons
                                name={iconName}
                                size={size}
                                color={color}
                            />
                        );
                    }

                    return (
                        <Ionicons name={iconName} size={size} color={color} />
                    );
                },
                tabBarActiveTintColor: '#0088CC',
                tabBarInactiveTintColor: 'gray',
                headerShown: false,
                tabBarStyle: (() => {
                    const state = navigation.getState();
                    const routes = state.routes;
                    const currentRoute = routes[state.index];
                    if (currentRoute.state && currentRoute.state.index > 0) {
                        return { display: 'none' };
                    }
                    return undefined;
                })()
            })}
        >
            <Tab.Screen name='Home' component={HomeScreen} />
            <Tab.Screen
                name='Analytics'
                component={AnalyticsScreen}
                options={{ headerTitleAlign: 'center' }}
            />
            <Tab.Screen name='Notifications' component={NotificationStack} />
            <Tab.Screen
                name='ProfileScreenStack'
                component={ProfileStack}
                options={{ headerShown: false, title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
