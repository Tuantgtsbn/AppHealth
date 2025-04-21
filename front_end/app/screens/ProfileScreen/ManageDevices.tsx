import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import CustomHeader from '@/components/ui/CustomHeader';
import Card from '@/components/ui/Card';
import { AntDesign, Feather } from '@expo/vector-icons';
import { Modal } from 'react-native';

export default function ManageDevices() {
    const [editedName, setEditedName] = useState('');
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const listDevices = [
        {
            id: 1,
            name: 'Device 1'
        },
        {
            id: 2,
            name: 'Device 2'
        },
        {
            id: 3,
            name: 'Device 3'
        }
    ];
    const handleEditDevice = (item) => {
        setSelectedDeviceId(item.id);
        setIsOpenModalEdit(true);
        console.log('Edit device', item.id);
        setEditedName(item.name);
    };
    const handleSelectDeletedDevice = (id: number) => {
        setIsOpenModalConfirmDelete(true);
        setSelectedDeviceId(id);
    };
    const [isOpenModalEdit, setIsOpenModalEdit] = useState(false);
    const [isOpenModalConfirmDelete, setIsOpenModalConfirmDelete] =
        useState(false);
    const handleConfirm = () => {
        console.log('Confirm', editedName);
        setIsOpenModalEdit(false);
    };
    const handleDeleteDevice = () => {
        console.log('Delete device', selectedDeviceId);
        setIsOpenModalConfirmDelete(false);
    };
    return (
        <View className='flex-1 bg-white'>
            <View className='mt-[16px]'>
                <CustomHeader title='Các thiết bị' />
                <View className='mt-[35px] px-[30px]'>
                    <Card>
                        <Text className='text-xl font-bold'>
                            Danh sách thiết bị
                        </Text>
                        {listDevices.map((item, index) => (
                            <View
                                className='flex-row justify-between items-center my-[10px]'
                                key={item.id}
                            >
                                <Text>{item.name}</Text>
                                <View className='flex-row gap-3'>
                                    <TouchableOpacity
                                        onPress={() => handleEditDevice(item)}
                                    >
                                        <Feather
                                            name='edit'
                                            size={24}
                                            color='black'
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        onPress={() =>
                                            handleSelectDeletedDevice(item.id)
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
                            Chỉnh sửa tên hiển thị
                        </Text>
                        <TextInput
                            value={editedName}
                            onChangeText={setEditedName}
                            className='border border-gray-300 rounded-[8px] p-[10px]'
                            placeholder='Tên hiển thị'
                        />

                        <View className='flex-row justify-end gap-4 mt-[16px]'>
                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-gray-200'
                                onPress={() => {
                                    setEditedName('');
                                    setIsOpenModalEdit(false);
                                }}
                            >
                                <Text className='text-base'>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-blue-500'
                                onPress={handleConfirm}
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
                visible={isOpenModalConfirmDelete}
                onRequestClose={() => setIsOpenModalConfirmDelete(false)}
            >
                <View className='flex-1 justify-center items-center bg-black/50'>
                    <View className='bg-white p-6 rounded-2xl w-[80%]'>
                        <Text className='text-xl font-semiboldmb-4'>
                            Bạn chắc chắn muốn xóa thiết bị này?
                        </Text>

                        <View className='flex-row justify-end gap-4 mt-[16px]'>
                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-gray-200'
                                onPress={() => {
                                    setIsOpenModalConfirmDelete(false);
                                }}
                            >
                                <Text className='text-base'>Hủy</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                className='px-6 py-3 rounded-full bg-blue-500'
                                onPress={handleDeleteDevice}
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
