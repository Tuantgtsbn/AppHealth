import React from 'react';
import { View } from 'react-native';

interface AppWrapperProps {
    children: React.ReactNode;
}

export const AppWrapper = ({ children }: AppWrapperProps) => {
    return <View className='flex-1 font-sans'>{children}</View>;
};
