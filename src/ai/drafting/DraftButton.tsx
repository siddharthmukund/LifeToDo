import React from 'react';
import { PenTool } from 'lucide-react';
import { useFeatureFlag } from '@/flags/useFeatureFlag';

interface DraftButtonProps {
    onClick: () => void;
}

export function DraftButton({ onClick }: DraftButtonProps) {
    const isAiEnabled = useFeatureFlag('ai_coach');

    if (!isAiEnabled) return null;

    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onClick();
            }}
            className="p-1.5 text-zinc-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-500/10 rounded-lg transition-colors group flex items-center gap-1.5"
            title="Draft content with AI"
        >
            <PenTool size={16} />
            <span className="text-[11px] font-medium hidden group-hover:inline-block px-1">Write</span>
        </button>
    );
}
