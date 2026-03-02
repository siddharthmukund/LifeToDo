import { platform, getPlugin } from '../';

export async function exportToNativeFiles(filename: string, content: string, mimeType: string): Promise<boolean> {
    if (!platform.isNative()) {
        // Web fallback: classic blob download
        if (typeof document === 'undefined') return false;
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    }

    const [fs, share] = await Promise.all([
        getPlugin<any>('filesystem'),
        getPlugin<any>('share')
    ]);

    if (!fs) return false;

    try {
        // Capacitor Filesystem
        const Directory = { Documents: 'DOCUMENTS' }; // From @capacitor/filesystem
        const Encoding = { UTF8: 'utf8' };            // From @capacitor/filesystem

        const writeResult = await fs.writeFile({
            path: filename,
            data: content,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });

        // Automatically pop open the native Share Sheet so they can save it to Drive/Files
        if (share && writeResult.uri) {
            await share.share({
                title: 'Export Life To Do Data',
                url: writeResult.uri,
                dialogTitle: 'Save your export',
            });
        }

        return true;
    } catch (error) {
        console.error('[FileService] Failed to export file natively', error);
        return false;
    }
}
