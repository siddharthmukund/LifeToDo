// Defines routing logic when a push notification is tapped
export interface PushPayload {
    type: 'inbox_nudge' | 'review_reminder' | 'streak_warning' | 'streak_celebration'
    | 'project_deadline' | 'sync_trigger' | 'ai_insight';
    targetScreen?: string;       // '/inbox', '/review', '/today'
    targetId?: string;           // Project ID, item ID
    data?: Record<string, unknown>;
}

export function routeNotification(payload: PushPayload, navigate: (path: string) => void): void {
    // If no specific targetScreen, use defaults based on type
    let route = payload.targetScreen;

    if (!route) {
        switch (payload.type) {
            case 'inbox_nudge': route = '/inbox'; break;
            case 'review_reminder': route = '/review'; break;
            case 'streak_warning': route = '/'; break;
            case 'project_deadline': route = `/projects/${payload.targetId}`; break;
            case 'sync_trigger': return; // Silent sync, no navigation
            case 'ai_insight': route = '/insights'; break;
            default: route = '/'; break;
        }
    }

    // Ensure route is valid before navigating
    if (route) {
        navigate(route);
    }
}
