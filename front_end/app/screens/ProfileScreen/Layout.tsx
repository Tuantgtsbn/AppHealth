import { createStackNavigator } from '@react-navigation/stack';
import ProfileScreen from './ProfileScreen';
import ManageDevices from './ManageDevices';
import NotificationSetting from './NotificationSetting';
import EditProfile from './EditProfile';
import ListRegisterEmail from './ListRegisterEmail';
import NotificationSettingMode from './NotificationMode';
import ManageThreshold from './ManageThreshold';

const stack = createStackNavigator();
const ProfileStack = () => {
    return (
        <stack.Navigator
            id='ProfileStack'
            screenOptions={{ headerShown: false }}
        >
            <stack.Screen name='Profile' component={ProfileScreen} />
            <stack.Screen name='EditProfile' component={EditProfile} />
            <stack.Screen name='ManageDevices' component={ManageDevices} />
            <stack.Screen
                name='NotificationSetting'
                component={NotificationSetting}
            />
            <stack.Screen
                name='ListRegisterEmail'
                component={ListRegisterEmail}
            />
            <stack.Screen
                name='NotificationMode'
                component={NotificationSettingMode}
            />
            <stack.Screen name='ManageThreshold' component={ManageThreshold} />
        </stack.Navigator>
    );
};
export default ProfileStack;
