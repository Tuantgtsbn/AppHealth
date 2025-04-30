import { createStackNavigator } from '@react-navigation/stack';
import NotificationScreen from './NotificationScreen';
import DetailNotification from './DetailNotification';

const Stack = createStackNavigator();
export default function NotificationStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name='Notification' component={NotificationScreen} />
            <Stack.Screen
                name='DetailNotification'
                component={DetailNotification}
            />
        </Stack.Navigator>
    );
}
