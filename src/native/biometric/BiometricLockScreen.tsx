'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Fingerprint } from 'lucide-react';

interface Props {
    isLocked: boolean;
    biometryType: string;
    onUnlock: () => Promise<void>;
    onUsePassword: () => void;
}

export function BiometricLockScreen({ isLocked, biometryType, onUnlock, onUsePassword }: Props) {
    if (!isLocked) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed inset-0 z-[999] bg-surface-base flex flex-col items-center justify-center supports-[backdrop-filter]:bg-surface-base/80 backdrop-blur-xl"
            >
                <div className="w-20 h-20 bg-status-ok rounded-3xl flex items-center justify-center mb-8 shadow-glow-success">
                    <Lock size={36} className="text-on-brand" />
                </div>

                <h1 className="text-2xl font-bold text-content-primary mb-2">Life To Do Locked</h1>
                <p className="text-content-secondary mb-10">
                    Verify your identity to continue
                </p>

                <button
                    onClick={onUnlock}
                    className="flex items-center gap-3 px-8 py-4 bg-primary text-on-brand font-semibold rounded-2xl active:scale-95 transition-all shadow-glow-accent"
                >
                    <Fingerprint size={20} />
                    Unlock with {biometryType === 'face' ? 'Face ID' : 'Biometrics'}
                </button>

                <button onClick={onUsePassword} className="mt-6 text-sm font-medium text-status-ok opacity-80 hover:opacity-100">
                    Use Password Instead
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
