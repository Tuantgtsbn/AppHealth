import { createStackNavigator } from '@react-navigation/stack';
import Welcome from './onboarding/Welcome';
import LoginScreen from './Login';
import RegisterScreen from './Register';
import CompleteProfile from './CompleteProfile';
import SuccessRegister from './SuccessRegister';

const stack = createStackNavigator();
export default function StackNavigationAuth() {
    return (
        <stack.Navigator screenOptions={{ headerShown: false }}>
            <stack.Screen name='Welcome' component={Welcome} />
            <stack.Screen name='Login' component={LoginScreen} />
            <stack.Screen name='Register' component={RegisterScreen} />
            <stack.Screen name='CompleteProfile' component={CompleteProfile} />
            <stack.Screen name='SuccessRegister' component={SuccessRegister} />
        </stack.Navigator>
    );
}
