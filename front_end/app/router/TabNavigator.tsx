import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import ExerciseScreen from '../screens/ExerciseScreen/ExerciseScreen';
import HistoryScreen from '../screens/HistoryScreen/HistoryScreen';
import ProfileStack from '@/screens/ProfileScreen/Layout';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
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
                tabBarInactiveTintColor: 'gray'
            })}
        >
            <Tab.Screen
                name='Home'
                component={HomeScreen}
                options={{ headerTitleAlign: 'center' }}
            />
            <Tab.Screen
                name='Analytics'
                component={ExerciseScreen}
                options={{ headerTitleAlign: 'center' }}
            />
            <Tab.Screen
                name='Notifications'
                component={HistoryScreen}
                options={{ headerTitleAlign: 'center' }}
            />
            <Tab.Screen
                name='ProfileScreenStack'
                component={ProfileStack}
                options={{ headerShown: false, title: 'Profile' }}
            />
        </Tab.Navigator>
    );
};

export default BottomTabNavigator;
