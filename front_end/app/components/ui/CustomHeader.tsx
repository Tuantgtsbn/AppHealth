import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

interface CustomHeaderProps {
    title: string;
    showBackButton?: boolean;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
    title,
    showBackButton = true
}) => {
    const navigation = useNavigation();

    return (
        <View style={styles.container}>
            {showBackButton ? (
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name='chevron-back' size={24} color='#1D1617' />
                </TouchableOpacity>
            ) : (
                <View style={styles.emptySpace} />
            )}

            <Text style={styles.title}>{title}</Text>

            <View style={styles.emptySpace} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        backgroundColor: '#FFFFFF'
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 30,
        lineHeight: 36,
        fontWeight: '700',
        color: '#000',
        textAlign: 'center',
        flex: 1
    },
    emptySpace: {
        width: 40
    }
});

export default CustomHeader;
