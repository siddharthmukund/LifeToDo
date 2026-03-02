'use client';
/**
 * RestorePurchases.tsx
 * One-button UI to restore App Store / Play Store purchases.
 * Required by both App Store and Play Store guidelines.
 * Renders nothing on web (Stripe tracks subscriptions server-side).
 */

import { useState } from 'react';
import { platform } from '../';
import { restorePurchases } from './billingService';

interface RestorePurchasesProps {
    onSuccess?: () => void;
    onFailure?: () => void;
    className?: string;
}

export function RestorePurchases({ onSuccess, onFailure, className = '' }: RestorePurchasesProps) {
    const [loading, setLoading]   = useState(false);
    const [message, setMessage]   = useState<string | null>(null);

    // Only relevant on native platforms
    if (!platform.isNative()) return null;

    const handleRestore = async () => {
        setLoading(true);
        setMessage(null);

        const ok = await restorePurchases();
        setLoading(false);

        if (ok) {
            setMessage('Pro subscription restored! ✓');
            onSuccess?.();
        } else {
            setMessage('No active Pro subscription found.');
            onFailure?.();
        }
    };

    return (
        <div className={`flex flex-col items-center gap-2 ${className}`}>
            <button
                onClick={handleRestore}
                disabled={loading}
                className="text-sm text-primary underline underline-offset-2 disabled:opacity-50"
            >
                {loading ? 'Restoring…' : 'Restore Purchases'}
            </button>
            {message && (
                <p className="text-xs text-content-secondary text-center">{message}</p>
            )}
        </div>
    );
}
