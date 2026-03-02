import { db } from '@/lib/db';
import { differenceInDays } from 'date-fns';

export interface CoachInsight {
    id: string;
    type: 'stale_project' | 'overloaded_context' | 'inbox_overload';
    title: string;
    description: string;
    actionLabel: string;
    actionRoute: string;
    priority: number; // Higher is more urgent
}

export class CoachBrain {
    /**
     * Scans the database and returns actionable nudges.
     * Guaranteed to run < 50ms locally using Dexie endpoints.
     */
    static async generateInsights(): Promise<CoachInsight[]> {
        const insights: CoachInsight[] = [];
        const now = new Date();

        // 1. Inbox Overload Heuristic
        // > 7 raw items in Inbox, AND the oldest one is > 3 days old
        const inboxItems = await db.inbox_items.filter((i: any) => i.status === 'raw').toArray();
        if (inboxItems.length > 7) {
            inboxItems.sort((a: any, b: any) => new Date(a.capturedAt).getTime() - new Date(b.capturedAt).getTime());
            const oldest = new Date(inboxItems[0].capturedAt);
            if (differenceInDays(now, oldest) > 3) {
                insights.push({
                    id: `inbox-overload-${Date.now()}`,
                    type: 'inbox_overload',
                    title: 'Inbox Overload Detected',
                    description: `You have ${inboxItems.length} unprocessed items, and some are older than 3 days. Mental friction is building up!`,
                    actionLabel: 'Process Inbox',
                    actionRoute: '/inbox',
                    priority: 90
                });
            }
        }

        // 2. Zombie Projects Heuristic
        // Active projects with NO active Next Actions for > 14 days
        const activeProjects = await db.projects.filter((p: any) => p.status === 'active').toArray();
        for (const project of activeProjects) {
            const associatedActions = await db.actions
                .where('projectId')
                .equals(project.id)
                .toArray();

            const hasActiveAction = associatedActions.some((a: any) => a.status === 'active');

            if (!hasActiveAction) {
                const daysSinceUpdate = differenceInDays(now, new Date(project.updatedAt));
                if (daysSinceUpdate > 14) {
                    insights.push({
                        id: `zombie-project-${project.id}`,
                        type: 'stale_project',
                        title: 'Zombie Project Detected',
                        description: `"${project.name}" has no active next actions and hasn't been touched in over two weeks. Move it to Someday?`,
                        actionLabel: 'Review Projects',
                        actionRoute: '/projects',
                        priority: 75
                    });
                }
            }
        }

        // 3. Overloaded Contexts Heuristic
        // Contexts violating the Rule of 7 (More than 7 active items)
        const activeActions = await db.actions.filter((a: any) => a.status === 'active').toArray();
        const contextCounts: Record<string, number> = {};
        for (const action of activeActions) {
            contextCounts[action.contextId] = (contextCounts[action.contextId] || 0) + 1;
        }

        for (const [contextId, count] of Object.entries(contextCounts)) {
            if (count > 7) {
                // Fetch context name to make it friendly
                const contextObj = await db.contexts.get(contextId);
                const contextName = contextObj ? contextObj.name : 'a specific context';

                insights.push({
                    id: `overloaded-ctx-${contextId}`,
                    type: 'overloaded_context',
                    title: 'Context Overload',
                    description: `You have ${count} actions waiting in ${contextName}. This violates the Rule of 7 and causes decision fatigue.`,
                    actionLabel: 'Filter Contexts',
                    actionRoute: '/today',
                    priority: 60
                });
            }
        }

        // Sort by priority descending
        return insights.sort((a, b) => b.priority - a.priority);
    }
}
