'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { usePushNotifications } from './usePushNotifications';
import { useGTDStore } from '@/store/gtdStore';

/**
 * PushPermissionPrompt:
 * Only shows up after 3 days of usage if the user has > 5 inbox items
 * and push hasn't been requested yet.
 */
export function PushPermissionPrompt() {
    const { isSupported, hasPermission, enablePush } = usePushNotifications();
    const { inboxItems } = useGTDStore();
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Basic heuristic check for eligibility
        if (!isSupported || hasPermission) return;

        const hasSeenPrompt = localStorage.getItem('seen_push_prompt');
        if (!hasSeenPrompt && inboxItems.length > 5) {
            // Could also check install date here for "3+ days" logic
            setShowPrompt(true);
        }
    }, [isSupported, hasPermission, inboxItems.length]);

    const handleGrant = async () => {
        await enablePush();
        setShowPrompt(false);
        localStorage.setItem('seen_push_prompt', 'true');
    };

    const handleDecline = () => {
        setShowPrompt(false);
        localStorage.setItem('seen_push_prompt', 'true');
    };

    if (!showPrompt) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="relative w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl p-6 shadow-2xl"
                >
                    <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-5 border border-indigo-100 dark:border-indigo-500/20">
                        <Bell size={28} className="text-indigo-500" />
                    </div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                        Stay on top of your GTD practice
                    </h2>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-6 leading-relaxed">
                        Life To Do can send gentle reminders for your weekly review, streak milestones, and when your inbox needs attention.
                    </p>
                    <div className="flex flex-col gap-3">
                        <button onClick={handleGrant} className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl">
                            Enable Notifications
                        </button>
                        <button onClick={handleDecline} className="w-full py-3.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium rounded-xl">
                            Not Now
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
