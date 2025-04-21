import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import React, { useState } from 'react';
import CustomHeader from '@/components/ui/CustomHeader';
import Card from '@/components/ui/Card';
import { AntDesign, Entypo, Feather } from '@expo/vector-icons';

export default function ListRegisterEmail() {
    const listEmails = [
        {
            id: 1,
            email: 'stefaniwong@gmail.com'
        },
        {
            id: 2,
            email: 'stefaniwong@gmail.com'
        },
        {
            id: 3,
            email: 'stefaniwong@gmail.com'
        }
    ];
    const [isOpenModalEdit, setIsOpenModalEdit] = useState(false);
    const [isOpenConfirmDelete, setIsOpenConfirmDelete] = useState(false);
    const [isOpenModalAdd, setIsOpenModalAdd] = useState(false);
    const [addedEmail, setAddedEmail] = useState('');
    const [editedEmail, setEditedEmail] = useState('');
    const [selectedEmailId, setSelectedEmailId] = useState(null);
    const handleEditEmail = (item) => {
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
    const handleConfirmEdit = () => {
        console.log('Confirm', editedEmail);
        setIsOpenModalEdit(false);
    };
    const handleConfirmDelete = () => {
        console.log('Delete email', selectedEmailId);
        setIsOpenConfirmDelete(false);
    };
    const handleConfirmAdd = () => {
        console.log('Add email', addedEmail);
        setIsOpenModalAdd(false);
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
                            {listEmails.map((item, index) => (
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
                            ))}
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
