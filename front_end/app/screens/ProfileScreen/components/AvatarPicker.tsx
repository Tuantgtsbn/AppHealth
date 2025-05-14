// AvatarPicker.js
import React, { useState } from 'react';
import {
    View,
    Image,
    Button,
    StyleSheet,
    ActivityIndicator,
    Alert
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '@config/firebase';
import * as FileSystem from 'expo-file-system';
import { useDispatch } from 'react-redux';
import { updateUserProfile } from '@/redux/userSlice';

export default function AvatarPicker({ avatarURL }) {
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const dispatch = useDispatch();
    // Hàm chọn ảnh từ thư viện
    const pickImage = async () => {
        // Xin quyền truy cập thư viện ảnh
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (status !== 'granted') {
            Alert.alert(
                'Cần quyền truy cập',
                'Vui lòng cấp quyền truy cập vào thư viện ảnh'
            );
            return;
        }

        // Hiển thị bộ chọn ảnh
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: 'images',
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    // Hàm tải ảnh lên Firebase Storage
    const uploadImage = async () => {
        if (!image) {
            Alert.alert('Lỗi', 'Vui lòng chọn ảnh trước khi tải lên');
            return;
        }

        setUploading(true);

        try {
            // Đọc file thành blob
            const { uri } = await FileSystem.getInfoAsync(image);
            const blob = await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.onload = () => {
                    resolve(xhr.response);
                };
                xhr.onerror = (e) => {
                    reject(new TypeError('Network request failed'));
                };
                xhr.responseType = 'blob';
                xhr.open('GET', uri, true);
                xhr.send(null);
            });

            // Tạo đường dẫn lưu trữ trên Firebase Storage
            const fileName = image.substring(image.lastIndexOf('/') + 1);
            const avatarRef = ref(storage, `avatars/${Date.now()}-${fileName}`);

            // Upload ảnh lên Firebase Storage
            await uploadBytes(avatarRef, blob);

            // Lấy URL của ảnh đã upload
            const downloadURL = await getDownloadURL(avatarRef);
            // Đóng blob
            blob.close();
            await dispatch(
                updateUserProfile({
                    id: auth.currentUser.uid,
                    profileData: {
                        avatar: downloadURL
                    }
                })
            ).unwrap();
            Alert.alert('Thành công', 'Ảnh avatar đã được cập nhật!');

            // Trả về URL để lưu vào database nếu cần
            console.log('Avatar URL:', downloadURL);

            // Tại đây bạn có thể lưu URL vào profile của user
        } catch (error) {
            console.error('Lỗi khi tải lên:', error);
            Alert.alert('Lỗi', 'Không thể tải ảnh lên. Vui lòng thử lại!');
        } finally {
            setUploading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.avatarContainer}>
                {image ? (
                    <Image source={{ uri: image }} style={styles.avatar} />
                ) : avatarURL ? (
                    <Image source={{ uri: avatarURL }} style={styles.avatar} />
                ) : (
                    <Image
                        style={styles.avatar}
                        source={require('@assets/images/default_avatar.jpg')}
                    />
                )}
            </View>

            <View style={styles.buttonContainer}>
                <Button title='Chọn ảnh' onPress={pickImage} />
                <Button
                    title='Cập nhật Avatar'
                    onPress={uploadImage}
                    disabled={!image || uploading}
                />
            </View>

            {uploading && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size='large' color='#0000ff' />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20
    },
    avatarContainer: {
        marginBottom: 20
    },
    avatar: {
        width: 150,
        height: 150,
        borderRadius: 75
    },
    placeholderAvatar: {
        backgroundColor: '#E1E1E1'
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 20
    },
    loadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)'
    }
});
