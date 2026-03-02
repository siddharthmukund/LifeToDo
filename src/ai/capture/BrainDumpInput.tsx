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
            <h3 className="text-lg font-semibold dark:text-white flex items-center gap-2">
                <Sparkles size={20} className="text-indigo-500" />
                Magic Brain Dump
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Paste a stream of thoughts, an email, or meeting notes. AI will extract the actionable tasks for you.
            </p>

            <textarea
                className="w-full min-h-[160px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 resize-y focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all dark:text-white"
                placeholder="I need to call the dentist, also email Sarah about the project timeline and don't forget to buy groceries..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                autoFocus
            />

            {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 p-3 rounded-lg border border-red-100 dark:border-red-500/20">
                    {error}
                </div>
            )}

            <button
                onClick={handleProcess}
                disabled={text.trim().length < 10 || isProcessing}
                className="w-full py-3.5 px-4 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl shadow transition-colors flex justify-center items-center gap-2"
            >
                {isProcessing ? (
                    <>
                        <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
