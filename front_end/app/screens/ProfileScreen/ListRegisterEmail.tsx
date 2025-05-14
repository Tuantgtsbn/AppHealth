import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import React, { useEffect, useState } from 'react';
import CustomHeader from '@/components/ui/CustomHeader';
import Card from '@/components/ui/Card';
import { AntDesign, Entypo, Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
    addEmail,
    deleteEmail,
    fetchUserEmails,
    updateEmail
} from '@/redux/emailSlice';
import Toast from 'react-native-toast-message';
import { checkEmail } from '@/utils/checkEmail';
export default function ListRegisterEmail() {
    const { loading, emails } = useSelector((state: RootState) => state.email);
    const { uid: id } = useSelector(
        (state: RootState) => state.auth?.user || 'jgr8crtfoRSr0ErsJlc75k7g1sl1'
    );
    const dispatch = useDispatch();
    useEffect(() => {
        async function fetchEmails() {
            try {
                await dispatch(fetchUserEmails(id)).unwrap();
            } catch (error) {
                console.log(error);
            }
        }
        fetchEmails();
    }, []);
    const [isOpenModalEdit, setIsOpenModalEdit] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [isOpenModalAdd, setIsOpenModalAdd] = useState(false);
    const [addedEmail, setAddedEmail] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [selectedEmailId, setSelectedEmailId] = useState(null);
    const [checkValid, setCheckValid] = useState(true);
    const handleEditEmail = (item) => {
        setCheckValid(true);
        setIsOpenModalEdit(true);
        setSelectedEmailId(item.id);
        console.log('Edit email', item.id);
        setEditedEmail(item.email);
    };
    const handleSelectDeletedEmail = (id) => {
        console.log('Delete email', id);
        setSelectedEmailId(id);
        setIsOpenConfirmDelete(true);
    };
    console.log(checkValid);
    const handleConfirmEdit = async () => {
        try {
            const isValid = checkEmail(editedEmail);
            setCheckValid(isValid);
            if (!isValid) {
                return;
            }
            await dispatch(
                updateEmail({
                    emailId: selectedEmailId,
                    newEmail: editedEmail,
                    userId: id
                })
            ).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Cập nhật email thành công'
            });
            setIsOpenModalEdit(false);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error
            });
        }
    };
    const handleConfirmDelete = async () => {
        try {
            await dispatch(deleteEmail(selectedEmailId)).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Xóa email thành công'
            });
            setIsOpenConfirmDelete(false);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error
            });
        }
    };
    const handleConfirmAdd = async () => {
        try {
            const isValid = checkEmail(addedEmail);
            setCheckValid(isValid);
            if (!isValid) {
                return;
            }
            await dispatch(
                addEmail({ userId: id, email: addedEmail })
            ).unwrap();
            Toast.show({
                type: 'success',
                text1: 'Thành công',
                text2: 'Thêm email thành công'
            });
            setIsOpenModalAdd(false);
            setAddedEmail('');
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Lỗi',
                text2: error
            });
        }
    };

    return (
        <View className='flex-1 bg-white'>
            <View className='mt-[16px]'>
                <CustomHeader title='Email' />
                <View className='mt-[35px] px-[30px]'>
                    <Card>
                        <View className='flex-row justify-between items-center'>
                            <Text className='font-bold text-xl'>
                                Danh sách email đăng ký
                            </Text>
                            <TouchableOpacity
                                className='w-[40px] h-[40px] bg-green-500 rounded-full justify-center items-center'
                                onPress={() => setIsOpenModalAdd(true)}
                            >
                                <Entypo name='plus' size={24} color='white' />
                            </TouchableOpacity>
                        </View>
                        <View>
                            {loading ? (
                                <View className='py-4 items-center'>
                                    <Text className='font-bold text-xl'>
                                        Đang tải...
                                    </Text>
                                </View>
                            ) : emails.length > 0 ? (
                                emails.map((item) => (
                                    <View
                                        className='flex-row justify-between my-[10px]'
                                        key={item.id}
                                    >
                                        <Text>{item.email}</Text>
                                        <View className='flex-row gap-3'>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleEditEmail(item)
                                                }
                                            >
                                                <Feather
                                                    name='edit'
                                                    size={24}
                                                    color='black'
                                                />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() =>
                                                    handleSelectDeletedEmail(
                                                        item.id
                                                    )
                                                }
                                            >
                                                <AntDesign
                                                    name='delete'
                                                    size={24}
                                                    color='black'
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                ))
                            ) : (
                                <View className='py-4 items-center'>
                                    <Text className='font-bold text-xl'>
                                        Chưa có email nào
                                    </Text>
                                </View>
                            )}
                        </View>
                    </Card>
                </View>
            </View>
            <Modal
                animationType='fade'
                transparent={true}
                visible={isOpenModalEdit}
                onRequestClose={() => setIsOpenModalEdit(false)}
            >
                <View className='flex-1 justify-center items-center bg-black/50'>
                    <View className='bg-white p-6 rounded-2xl w-[80%]'>
                        <Text className='text-xl font-semibold text-center mb-4'>
                            Chỉnh sửa email
                        </Text>
                        <TextInput
                            value={editedEmail}
                            onChangeText={setEditedEmail}
                            className='border border-gray-300 rounded-[8px] p-[10px]'
                            placeholder='Email'
                        />
                        {!checkValid && (
                            <Text className='text-red-500'>
                                Email không hợp lệ
                            </Text>
                        )}
                        <View className='flex-row justify-end gap-4 mt-[16px]'>
                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-gray-200'
                                onPress={() => {
                                    setEditedEmail('');
                                    setIsOpenModalEdit(false);
                                }}
                            >
                                <Text className='text-base'>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-blue-500'
                                onPress={handleConfirmEdit}
                            >
                                <Text className='text-base text-white'>
                                    Xác nhận
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType='fade'
                transparent={true}
                visible={isOpenConfirmDelete}
                onRequestClose={() => setIsOpenConfirmDelete(false)}
            >
                <View className='flex-1 justify-center items-center bg-black/50'>
                    <View className='bg-white p-6 rounded-2xl w-[80%]'>
                        <Text className='text-xl font-semibold text-center mb-4'>
                            Bạn chắc chắn muốn xóa email này ?
                        </Text>

                        <View className='flex-row justify-end gap-4 mt-[16px]'>
                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-gray-200'
                                onPress={() => {
                                    setSelectedEmailId(null);
                                    setIsOpenConfirmDelete(false);
                                }}
                            >
                                <Text className='text-base'>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-blue-500'
                                onPress={handleConfirmDelete}
                            >
                                <Text className='text-base text-white'>
                                    Xác nhận
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
            <Modal
                animationType='fade'
                transparent={true}
                visible={isOpenModalAdd}
                onRequestClose={() => setIsOpenModalAdd(false)}
            >
                <View className='flex-1 justify-center items-center bg-black/50'>
                    <View className='bg-white p-6 rounded-2xl w-[80%]'>
                        <Text className='text-xl font-semibold text-center mb-4'>
                            Thêm email
                        </Text>
                        <TextInput
                            value={addedEmail}
                            onChangeText={setAddedEmail}
                            className='border border-gray-300 rounded-[8px] p-[10px]'
                            placeholder='Email'
                        />
                        {!checkValid && (
                            <Text className='text-red-500'>
                                Email không hợp lệ
                            </Text>
                        )}
                        <View className='flex-row justify-end gap-4 mt-[16px]'>
                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-gray-200'
                                onPress={() => {
                                    setIsOpenModalAdd(false);
                                    setAddedEmail('');
                                }}
                            >
                                <Text className='text-base'>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-blue-500'
                                onPress={handleConfirmAdd}
                            >
                                <Text className='text-base text-white'>
                                    Xác nhận
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
