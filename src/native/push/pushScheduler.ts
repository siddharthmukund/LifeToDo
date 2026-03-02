import { getPlugin, platform } from '../';

// Schedule local notifications for review reminders, streak warnings
export async function scheduleLocalNotification(options: {
    id: number;
    title: string;
    body: string;
    scheduleAt: Date;
    extra?: any;
}) {
    if (!platform.isNative()) return;

    const localNotifs = await getPlugin<any>('local-notifications');
    if (!localNotifs) return;

    await localNotifs.schedule({
        notifications: [{
            id: options.id,
            title: options.title,
            body: options.body,
            schedule: { at: options.scheduleAt },
            extra: options.extra,
            smallIcon: 'ic_notification',
        }]
    });
}

export async function cancelLocalNotifications(ids: number[]) {
    if (!platform.isNative()) return;

    const localNotifs = await getPlugin<any>('local-notifications');
    if (!localNotifs) return;

    await localNotifs.cancel({
        notifications: ids.map(id => ({ id }))
    });
}
