import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from '@expo/vector-icons/Ionicons';
import HomeScreen from '../screens/HomeScreen/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen/ProfileScreen';
import ExerciseScreen from '../screens/ExerciseScreen/ExerciseScreen';
import HistoryScreen from '../screens/HistoryScreen/HistoryScreen';

const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Exercise') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#0088CC',
        tabBarInactiveTintColor: 'gray'
      })}
    >
      <Tab.Screen name='Home' component={HomeScreen} options={{ headerTitleAlign: 'center' }} />
      <Tab.Screen
        name='Exercise'
        component={ExerciseScreen}
        options={{ headerTitleAlign: 'center' }}
      />
      <Tab.Screen
        name='History'
        component={HistoryScreen}
        options={{ headerTitleAlign: 'center' }}
      />
      <Tab.Screen
        name='Profile'
        component={ProfileScreen}
        options={{ headerTitleAlign: 'center' }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
