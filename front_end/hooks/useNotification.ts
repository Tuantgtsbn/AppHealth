import { useEffect, useState } from 'react';
import {
    NotificationMode,
    getNotificationMode
} from '@/utils/notificationSettings';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';

export const useNotification = () => {
    const [notificationMode, setNotificationMode] =
        useState<NotificationMode>('silent');

    useEffect(() => {
        loadNotificationMode();
    }, []);

    const loadNotificationMode = async () => {
        try {
            const mode = await getNotificationMode();
            setNotificationMode(mode);
        } catch (error) {
            console.log(error);
        }
    };
    const notify = async (message: string) => {
        switch (notificationMode) {
            case 'vibration':
                await Haptics.notificationAsync(
                    Haptics.NotificationFeedbackType.Success
                );
                break;
            case 'sound':
                const { sound } = await Audio.Sound.createAsync(
                    require('@assets/sounds/samsung_notifications.mp3')
                );
                await sound.playAsync();
                break;
            default:
                // Silent mode - do nothing
                break;
        }
    };

    return {
        notificationMode,
        notify,
        setNotificationMode
    };
};
