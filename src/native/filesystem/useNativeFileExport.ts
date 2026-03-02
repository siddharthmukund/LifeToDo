'use client';
import { useCallback } from 'react';
import { exportToNativeFiles } from './fileService';

export function useNativeFileExport() {
    const exportData = useCallback(async (data: Record<string, any>, format: 'json' | 'csv') => {
        const filename = `life-to-do-export-${new Date().toISOString().split('T')[0]}.${format}`;

        // Simplistic CSV converter for demonstration constraint (actual usually uses papaparse)
        const content = format === 'json'
            ? JSON.stringify(data, null, 2)
            : `data_type,count\nitems,${Object.keys(data).length}`;

        const mimeType = format === 'json' ? 'application/json' : 'text/csv';

        return await exportToNativeFiles(filename, content, mimeType);
    }, []);

    return { exportData };
}
