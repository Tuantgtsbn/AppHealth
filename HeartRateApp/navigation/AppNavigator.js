import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

// Màn hình
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import DailyChartScreen from '../screens/DailyChartScreen';
import MonthlyChartScreen from '../screens/MonthlyChartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationScreen from '../screens/NotificationScreen';
import DetailNotificationScreen from '../screens/DetailNotificationScreen';


const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator cho màn hình chính sau khi đăng nhập
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Daily') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Monthly') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Notification') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: '#FF4757',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ 
          title: 'Trang chủ', 
          headerShown: false
        }} 
      />

      <Tab.Screen 
        name="Daily" 
        component={DailyChartScreen} 
        options={{ 
          title: 'Hằng ngày',
          headerShown: false
        }} 
      />

      <Tab.Screen 
        name="Monthly" 
        component={MonthlyChartScreen} 
        options={{ 
          title: 'Hằng tháng',
          headerShown: false
        }} 
      />

      <Tab.Screen 
        name="Notification" 
        component={NotificationScreen} 
        options={{ 
          title: 'Thông báo', 
          headerShown: false
        }} 
      />

      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          title: 'Hồ sơ', 
          headerShown: false
        }} 
      />
    </Tab.Navigator>
  );
}

// Root Navigator
function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="DetailNotification" component={DetailNotificationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;