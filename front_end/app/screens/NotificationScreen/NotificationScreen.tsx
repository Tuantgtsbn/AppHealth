import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
function NotificationScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Danh sách các bài tập</Text>
            <Text>Danh sách các bài tập của bạn tại đâyđây</Text>
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    }
});
export default NotificationScreen;
