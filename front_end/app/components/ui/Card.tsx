import { View, Text } from 'react-native';
import React from 'react';
type CardProps = {
    className?: string;
    children?: React.ReactNode;
};
export default function Card({ className, children }: CardProps) {
    return (
        <View
            style={{
                paddingHorizontal: 16,
                paddingVertical: 20,
                borderRadius: 16,
                backgroundColor: '#ffffff',
                shadowColor: '#000',
                shadowOffset: { width: 1, height: 1 },
                shadowOpacity: 0.3,
                shadowRadius: 6,
                elevation: 3,
                gap: 8
            }}
            className={className}
        >
            {children}
        </View>
    );
}
