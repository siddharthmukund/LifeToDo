import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface BrainDumpInputProps {
    onProcess: (text: string) => void;
    isProcessing: boolean;
    error: string | null;
}

export function BrainDumpInput({ onProcess, isProcessing, error }: BrainDumpInputProps) {
    const [text, setText] = useState('');

    const handleProcess = () => {
        if (!text.trim() || isProcessing) return;
        onProcess(text);
    };

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-content-primary flex items-center gap-2">
                <Sparkles size={20} className="text-primary-ink" />
                Magic Brain Dump
            </h3>
            <p className="text-sm text-content-secondary">
                Paste a stream of thoughts, an email, or meeting notes. AI will extract the actionable tasks for you.
            </p>

            <textarea
                className="w-full min-h-[160px] p-4 rounded-xl border border-border-default bg-surface-base resize-y focus:ring-2 focus:ring-primary/50 outline-none transition-all text-content-primary"
                placeholder="I need to call the dentist, also email Sarah about the project timeline and don't forget to buy groceries..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
            />

            {error && (
                <div className="text-sm text-status-error bg-status-error/10 p-3 rounded-lg border border-status-danger/20">
                    {error}
                </div>
            )}

            <button
                onClick={handleProcess}
                disabled={text.trim().length < 10 || isProcessing}
                className="w-full py-3.5 px-4 bg-primary hover:bg-primary/90 active:bg-primary/80 disabled:opacity-50 text-on-brand font-medium rounded-xl shadow transition-colors flex justify-center items-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <div className="size-4 border-2 border-on-brand/30 border-t-on-brand rounded-full animate-spin" />
                        Processing with AI...
                    </>
                ) : (
                    <>
                        <Sparkles size={16} />
                        Extract Tasks
                    </>
                )}
            </button>
        </div>
    );
}
