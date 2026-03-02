'use client';
import { useState, useEffect } from 'react';
import { platform } from './platform';
import { detectCapabilities, PlatformCapabilities } from './capabilities';

export function usePlatform() {
    const [capabilities, setCapabilities] = useState<PlatformCapabilities | null>(null);

    useEffect(() => {
        detectCapabilities().then(setCapabilities);
    }, []);

    return {
        isNative: platform.isNative(),
        isIOS: platform.isIOS(),
        isAndroid: platform.isAndroid(),
        isWeb: platform.isWeb(),
        platformType: platform.getPlatform(),
        capabilities,
    };
}
