import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    Image
} from 'react-native';
import React, { useState } from 'react';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { firstCompleteUserProfile } from '@/redux/userSlice';
import { useDispatch, useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import { RootState } from '@/redux/store';

export default function CompleteProfile({ navigation }) {
    const dispatch = useDispatch();
    const { isAuthenticated, user } = useSelector(
        (state: RootState) => state.auth
    );
    const id = user?.uid;
    // State cho gender dropdown
    const [open, setOpen] = useState(false);
    const [gender, setGender] = useState(null);
    const [items, setItems] = useState([
        { label: 'Nam', value: 'male' },
        { label: 'Nữ', value: 'female' },
        { label: 'Khác', value: 'other' }
    ]);
    const [weight, setWeight] = useState('');
    const [height, setHeight] = useState('');
    const [date, setDate] = useState(new Date());
    const [has_hypertension, setHasHypertension] = useState(false);
    const [has_diabetes, setHasDiabetes] = useState(false);
    const [itemsHypertension, setItemsHypertension] = useState([
        { label: 'Có', value: true },
        { label: 'Không', value: false }
    ]);
    const [itemsDiabetes, setItemsDiabetes] = useState([
        { label: 'Có', value: true },
        { label: 'Không', value: false }
    ]);
    const [openHypertension, setOpenHypertension] = useState(false);
    const [openDiabetes, setOpenDiabetes] = useState(false);
    const formData = {
        gender,
        dateOfBirth: format(date, 'yyyy-MM-dd'),
        weight: {
            unit: 'kg',
            value: weight
        },
        height: {
            unit: 'cm',
            value: height
        },
        has_hypertension,
        has_diabetes
    };
    console.log('formData', formData);
    const checkValid = () => {
        return gender && formData.dateOfBirth && weight && height;
    };
    const handleCompleteProfile = async () => {
        if (!checkValid()) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: 'Vui lòng nhập đầy đủ thông tin'
            });
            return;
        }
        try {
            await dispatch(
                firstCompleteUserProfile({ id, profileData: formData })
            ).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Cập nhật hồ sơ thành công'
            });
            navigation.navigate('MainApp', { screen: 'Home' });
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error
            });
        }
    };
    // State cho date picker
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(Platform.OS === 'ios');
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const showDatePickerModal = () => {
        setShowDatePicker(true);
    };
    const handleUpdateProfile = (id) => {};
    return (
        <KeyboardAwareScrollView
            className='bg-white'
            contentContainerStyle={{
                paddingHorizontal: 24,
                paddingTop: 40,
                paddingBottom: 40
            }}
            enableOnAndroid={true}
            enableResetScrollToCoords={false}
            keyboardShouldPersistTaps='handled'
            showsVerticalScrollIndicator={false}
        >
            {/* Placeholder hình vuông đen */}
            <View className='mx-auto mb-6'>
                <Image
                    style={{ width: 375, height: 350 }}
                    source={require('@assets/images/completeProfile.png')}
                />
            </View>

            <Text className='text-2xl font-semibold text-center mb-2'>
                Hãy hoàn thành hồ sơ cá nhân
            </Text>

            <Text className='text-gray-500 text-center mb-8'>
                Nó sẽ giúp chúng tôi hiểu hơn về bạn!
            </Text>

            {/* Form inputs */}
            <View className='gap-4'>
                {/* Gender Selection với DropDownPicker */}
                <Text className='font-bold text-[18px]'>Giới tính</Text>
                <View style={{ zIndex: 1000 }} className=''>
                    <DropDownPicker
                        open={open}
                        value={gender}
                        items={items}
                        setOpen={setOpen}
                        setValue={setGender}
                        setItems={setItems}
                        placeholder='Choose Gender'
                        style={{
                            borderColor: '#e5e7eb',
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: '#f7f8f8'
                        }}
                        textStyle={{
                            color: '#9ca3af'
                        }}
                        dropDownContainerStyle={{
                            borderColor: '#e5e7eb',
                            borderRadius: 12
                        }}
                        theme='LIGHT'
                    />
                </View>

                {/* Date of Birth với DatePicker */}
                <Text className='font-bold text-[18px]'>Ngày sinh</Text>
                <TouchableOpacity
                    onPress={showDatePickerModal}
                    className='border border-gray-200 rounded-xl p-4 bg-[#f7f8f8]'
                >
                    <Text className='text-gray-400'>
                        {format(date, 'dd/MM/yyyy')}
                    </Text>
                </TouchableOpacity>

                {showDatePicker && (
                    <DateTimePicker
                        value={date}
                        mode='date'
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date()}
                    />
                )}
                <Text className='font-bold text-[18px]'>Cân nặng</Text>
                {/* Weight Input */}
                <View className='flex-row items-center'>
                    <View className='flex-1 border border-gray-200 rounded-xl px-4 py-2 bg-[#f7f8f8]'>
                        <TextInput
                            value={weight}
                            onChangeText={setWeight}
                            placeholder='Your Weight'
                            className='text-gray-400'
                        />
                    </View>
                    <View className='px-4 bg-primary ml-2 rounded-xl items-center justify-center h-[52px]'>
                        <Text className='text-white'>KG</Text>
                    </View>
                </View>
                <Text className='font-bold text-[18px]'>Chiều cao</Text>
                {/* Height Input */}
                <View className='flex-row items-center'>
                    <View className='flex-1 border border-gray-200 rounded-xl px-4 py-2 bg-[#f7f8f8]'>
                        <TextInput
                            value={height}
                            onChangeText={setHeight}
                            placeholder='Your Height'
                            className='text-gray-400'
                        />
                    </View>
                    <View className='px-4 bg-primary ml-2 rounded-xl items-center justify-center h-[52px]'>
                        <Text className='text-white'>CM</Text>
                    </View>
                </View>
                <Text className='font-bold text-[18px]'>
                    Bạn có bệnh huyết áp không?
                </Text>
                <View
                    style={{ zIndex: openHypertension ? 1000 : 50 }}
                    className=''
                >
                    <DropDownPicker
                        open={openHypertension}
                        value={has_hypertension}
                        items={itemsHypertension}
                        setOpen={setOpenHypertension}
                        setValue={setHasHypertension}
                        setItems={setItemsHypertension}
                        placeholder='Ban có bệnh huyết áp không?'
                        style={{
                            borderColor: '#e5e7eb',
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: '#f7f8f8'
                        }}
                        textStyle={{
                            color: '#9ca3af'
                        }}
                        dropDownContainerStyle={{
                            borderColor: '#e5e7eb',
                            borderRadius: 12
                        }}
                        theme='LIGHT'
                    />
                </View>
                <Text className='font-bold text-[18px]'>
                    Bạn có bệnh tiểu đường không?
                </Text>
                <View style={{ zIndex: openDiabetes ? 1000 : 50 }} className=''>
                    <DropDownPicker
                        open={openDiabetes}
                        value={has_diabetes}
                        items={itemsDiabetes}
                        setOpen={setOpenDiabetes}
                        setValue={setHasDiabetes}
                        setItems={setItemsDiabetes}
                        placeholder='Bạn có bệnh tiểu đường không?'
                        style={{
                            borderColor: '#e5e7eb',
                            borderRadius: 12,
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            backgroundColor: '#f7f8f8'
                        }}
                        textStyle={{
                            color: '#9ca3af'
                        }}
                        dropDownContainerStyle={{
                            borderColor: '#e5e7eb',
                            borderRadius: 12
                        }}
                        theme='LIGHT'
                    />
                </View>
            </View>

            {/* Continue Button */}
            <TouchableOpacity
                onPress={handleCompleteProfile}
                className='bg-blue-400 rounded-full py-4 mt-8 flex-row gap-1 items-center justify-center'
            >
                <Text className='text-white text-center font-2xl font-bold'>
                    Tiếp tục
                </Text>
                <MaterialIcons name='navigate-next' size={24} color='white' />
            </TouchableOpacity>
        </KeyboardAwareScrollView>
    );
}
