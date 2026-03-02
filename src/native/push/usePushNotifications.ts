'use client';

import { useState, useEffect, useCallback } from 'react';
import { requestPushPermission, registerPush, addPushListeners, removeAllPushListeners } from './pushService';
import { platform, detectCapabilities } from '../';

export function usePushNotifications() {
    const [hasPermission, setHasPermission] = useState<boolean>(false);
    const [pushToken, setPushToken] = useState<string | null>(null);
    const [isSupported, setIsSupported] = useState<boolean>(false);

    useEffect(() => {
        detectCapabilities().then(caps => {
            setIsSupported(caps.push || (!platform.isNative() && typeof Notification !== 'undefined'));

            // Check existing permissions on load
            if (!platform.isNative() && typeof Notification !== 'undefined') {
                setHasPermission(Notification.permission === 'granted');
            } else if (caps.push) {
                // Native check via the plugin registry (no @capacitor/* import needed)
                const PushNotifications = platform.getPlugin<any>('PushNotifications');
                if (PushNotifications) {
                    PushNotifications.checkPermissions()
                        .then((result: { receive: string }) => {
                            setHasPermission(result.receive === 'granted');
                        })
                        .catch(() => { });
                }
            }
        });

        return () => {
            removeAllPushListeners();
        };
    }, []);

    const enablePush = useCallback(async () => {
        if (!isSupported) return false;

        const granted = await requestPushPermission();
        setHasPermission(granted);

        if (granted) {
            const token = await registerPush();
            setPushToken(token);
        }

        return granted;
    }, [isSupported]);

    // Can inject specific router setup here
    const setupRouter = useCallback((navigate: (url: string) => void) => {
        addPushListeners(
            (notification) => {
                // Handle foreground notification visually here if needed
                console.log('Received foreground notification', notification);
            },
            (action) => {
                // Handle tapped notification
                console.log('Tapped notification', action);
                // Extract payload and navigate
                const payload = action.notification.data;
                if (payload && payload.type) {
                    import('./pushRouter').then(({ routeNotification }) => {
                        routeNotification(payload, navigate);
                    });
                }
            }
        );
    }, []);

    return { isSupported, hasPermission, pushToken, enablePush, setupRouter };
}
