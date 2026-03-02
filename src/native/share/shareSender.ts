import { platform, getPlugin } from '../';

export async function shareOutbound(options: {
    title: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
}): Promise<boolean> {
    if (!platform.isNative()) {
        if (typeof navigator !== 'undefined' && navigator.share) {
            try {
                await navigator.share(options);
                return true;
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('[Share] Web share failed', err);
                }
                return false;
            }
        }
        return false; // Not supported
    }

    const share = await getPlugin<any>('share');
    if (!share) return false;

    try {
        const result = await share.share({
            title: options.title,
            text: options.text,
            url: options.url,
            dialogTitle: options.dialogTitle || 'Share Life To Do'
        });
        return true; // Technically 'result' has an activityType, but boolean is simpler
    } catch (error) {
        console.error('[Share] Native share failed', error);
        return false;
    }
}
