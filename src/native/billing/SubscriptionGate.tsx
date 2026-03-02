'use client';
/**
 * SubscriptionGate.tsx
 * Wraps any Pro-only content. Shows children if the user is Pro;
 * otherwise renders a configurable fallback (upgrade prompt by default).
 */

import { useSubscriptionStatus } from './useSubscriptionStatus';

interface SubscriptionGateProps {
    children: React.ReactNode;
    /** Rendered when the user is not Pro. Defaults to null (renders nothing). */
    fallback?: React.ReactNode;
    /** While the status is loading, render this. Defaults to null. */
    loader?: React.ReactNode;
}

export function SubscriptionGate({
    children,
    fallback = null,
    loader   = null,
}: SubscriptionGateProps): React.ReactElement | null {
    const { status, loading } = useSubscriptionStatus();

    if (loading)        return loader   as React.ReactElement | null;
    if (!status.active) return fallback as React.ReactElement | null;

    return children as React.ReactElement;
}
