import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RootState } from '@/redux/store';
import { useSelector } from 'react-redux';

const HealthMetricCard = ({
    title,
    unit,
    icon,
    iconColor,
    createdAt = '',
    value,
    isWarning
}) => {
    return (
        <View style={[styles.card, isWarning && styles.warningCard]}>
            <View style={styles.iconContainer}>
                <Ionicons name={icon} size={28} color={iconColor} />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.title}>{title}</Text>
                {createdAt && <Text style={styles.title}>{createdAt}</Text>}
                <View style={styles.valueContainer}>
                    <Text
                        style={[styles.value, isWarning && styles.warningText]}
                    >
                        {value}
                    </Text>
                    <Text style={styles.unit}>{unit}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3
    },
    warningCard: {
        borderWidth: 1,
        borderColor: '#FF4757',
        backgroundColor: '#FFF5F5'
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F5F5F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15
    },
    contentContainer: {
        flex: 1
    },
    title: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'baseline'
    },
    value: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333'
    },
    warningText: {
        color: '#FF4757'
    },
    unit: {
        fontSize: 14,
        color: '#666',
        marginLeft: 5
    }
});

export default HealthMetricCard;
