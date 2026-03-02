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
                className="fixed inset-0 z-[999] bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center supports-[backdrop-filter]:bg-zinc-50/80 supports-[backdrop-filter]:dark:bg-zinc-950/80 backdrop-blur-xl"
            >
                <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-emerald-500/20">
                    <Lock size={36} className="text-white" />
                </div>

                <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Life To Do Locked</h1>
                <p className="text-zinc-500 dark:text-zinc-400 mb-10">
                    Verify your identity to continue
                </p>

                <button
                    onClick={onUnlock}
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-2xl active:scale-95 transition-all shadow-xl shadow-black/10 dark:shadow-white/10"
                >
                    <Fingerprint size={20} />
                    Unlock with {biometryType === 'face' ? 'Face ID' : 'Biometrics'}
                </button>

                <button onClick={onUsePassword} className="mt-6 text-sm font-medium text-emerald-600 dark:text-emerald-400 opacity-80 hover:opacity-100">
                    Use Password Instead
                </button>
            </motion.div>
        </AnimatePresence>
    );
}
