'use client';
import { useState, useEffect } from 'react';
import { Shield, Smartphone } from 'lucide-react';
import { useBiometric } from './useBiometric';
import { useGTDStore } from '@/store/gtdStore';

/**
 * Settings panel to enable/disable biometric app lock.
 */
export function BiometricSettings() {
    const { isAvailable, biometryType, authenticate } = useBiometric();
    // Using GTD store to track biometric settings state locally (or create a dedicated native settings store)
    const { settings, updateSettings } = useGTDStore();
    const [isEnabled, setIsEnabled] = useState(false);

    useEffect(() => {
        if (settings && (settings as any).biometricLockEnabled !== undefined) {
            setIsEnabled((settings as any).biometricLockEnabled);
        }
    }, [settings]);

    if (!isAvailable) return null;

    const handleToggle = async () => {
        // Require authentication to change the setting
        const success = await authenticate(`Confirm changes to ${biometryType} lock`);
        if (success) {
            const nextState = !isEnabled;
            setIsEnabled(nextState);
            await updateSettings({ biometricLockEnabled: nextState } as any);
        }
    };

    const bioName = biometryType === 'face' ? 'Face ID' : 'Fingerprint / Biometrics';

    return (
        <div className="bg-surface-card rounded-2xl border border-border-default divide-y divide-border-subtle mb-6">
            <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-status-ok/10 border border-status-ok/20">
                        <Shield size={16} className="text-status-ok" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-content-primary">App Lock</p>
                        <p className="text-xs text-content-secondary mt-0.5">Require {bioName} to unlock Life To Do</p>
                    </div>
                </div>
                <button
                    onClick={handleToggle}
                    className={`relative w-11 h-6 rounded-full transition-colors active:scale-95
              ${isEnabled ? 'bg-status-ok shadow-glow-success' : 'bg-overlay-active'}`}
                >
                    <span
                        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
              ${isEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                </button>
            </div>
        </div>
    );
}
