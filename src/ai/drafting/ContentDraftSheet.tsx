import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, PenTool, Mail, MessageSquare, List, Lightbulb, Copy, Check } from 'lucide-react';
import { useContentDrafter } from './useContentDrafter';
import { DraftType } from '../prompts/contentDraft';

interface ContentDraftSheetProps {
    isOpen: boolean;
    onClose: () => void;
    taskTitle: string;
}

export function ContentDraftSheet({ isOpen, onClose, taskTitle }: ContentDraftSheetProps) {
    const { draft, isDrafting, result, error, clear } = useContentDrafter();

    const [selectedType, setSelectedType] = useState<DraftType>('email');
    const [contextNotes, setContextNotes] = useState('');
    const [copied, setCopied] = useState(false);

    const types: { id: DraftType, label: string, icon: React.ReactNode }[] = [
        { id: 'email', label: 'Email', icon: <Mail size={16} /> },
        { id: 'message', label: 'Message', icon: <MessageSquare size={16} /> },
        { id: 'outline', label: 'Outline', icon: <List size={16} /> },
        { id: 'brainstorm', label: 'Ideas', icon: <Lightbulb size={16} /> }
    ];

    const handleClose = () => {
        clear();
        setContextNotes('');
        setCopied(false);
        onClose();
    };

    const handleGenerate = () => {
        draft(taskTitle, selectedType, contextNotes);
    };

    const handleCopy = () => {
        if (!result) return;
        const textToCopy = result.suggestedSubject
            ? `Subject: ${result.suggestedSubject}\n\n${result.draft}`
            : result.draft;

        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity"
                    />

                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-zinc-950 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] pb-safe-area flex flex-col max-h-[90vh] h-[700px] border-t border-border-default/50"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center py-3 shrink-0">
                            <div className="w-12 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                        </div>

                        <div className="absolute top-4 right-4 shrink-0 z-10">
                            <button onClick={handleClose} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="px-5 pb-5 flex-1 min-h-0 overflow-y-auto w-full max-w-2xl mx-auto custom-scrollbar flex flex-col">
                            <h3 className="text-xl font-semibold dark:text-white flex items-center gap-2 mb-1">
                                <PenTool size={22} className="text-purple-500" />
                                AI Content Drafter
                            </h3>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 line-clamp-2">
                                For task: <span className="font-medium text-zinc-700 dark:text-zinc-300">"{taskTitle}"</span>
                            </p>

                            {!result && !isDrafting && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col gap-6">
                                    {/* Format Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                                            What do you need written?
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                            {types.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => setSelectedType(t.id)}
                                                    className={`
                                                        p-3 rounded-xl border flex flex-col items-center gap-2 transition-all
                                                        ${selectedType === t.id
                                                            ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-500 text-purple-700 dark:text-purple-400'
                                                            : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'}
                                                    `}
                                                >
                                                    {t.icon}
                                                    <span className="text-xs font-semibold">{t.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Context Area */}
                                    <div className="flex-1 flex flex-col">
                                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                                            Any additional notes? <span className="text-zinc-400 font-normal">(Optional)</span>
                                        </label>
                                        <textarea
                                            value={contextNotes}
                                            onChange={e => setContextNotes(e.target.value)}
                                            placeholder="e.g. Keep it friendly, mention we need this by Friday, etc."
                                            className="w-full flex-1 min-h-[120px] max-h-[200px] p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 resize-none focus:ring-2 focus:ring-purple-500/50 outline-none text-zinc-900 dark:text-zinc-100"
                                        />
                                    </div>

                                    {error && (
                                        <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl">
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleGenerate}
                                        className="w-full py-4 bg-purple-500 hover:bg-purple-600 active:bg-purple-700 text-white font-medium rounded-xl shadow transition-colors flex items-center justify-center gap-2"
                                    >
                                        <PenTool size={18} /> Generate Draft
                                    </button>
                                </motion.div>
                            )}

                            {isDrafting && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center">
                                    <div className="p-4 bg-purple-50 dark:bg-purple-500/10 text-purple-500 rounded-2xl mb-4 relative isolate">
                                        <PenTool size={32} className="animate-pulse relative z-10" />
                                        <div className="absolute inset-0 bg-purple-400 blur-xl opacity-30 animate-pulse delay-75 pointer-events-none" />
                                    </div>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Drafting your {selectedType}...</h3>
                                    <p className="text-sm text-zinc-500">The AI is structuring your thoughts right now.</p>
                                </div>
                            )}

                            {result && !isDrafting && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col gap-4 min-h-0">
                                    <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 custom-scrollbar relative group">

                                        <button
                                            onClick={handleCopy}
                                            className="absolute top-4 right-4 p-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300 shadow-sm hover:text-purple-500 transition-colors z-10"
                                        >
                                            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                                        </button>

                                        {result.suggestedSubject && (
                                            <div className="mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                                                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 block">Subject</span>
                                                <p className="font-medium text-zinc-900 dark:text-zinc-100">{result.suggestedSubject}</p>
                                            </div>
                                        )}
                                        <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-zinc-800 dark:text-zinc-300 font-serif">
                                            {result.draft}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 shrink-0 pt-2 border-t border-border-default">
                                        <button
                                            onClick={clear}
                                            className="flex-1 py-3 text-zinc-600 dark:text-zinc-300 font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors"
                                        >
                                            Discard & Try Again
                                        </button>
                                        <button
                                            onClick={() => {
                                                handleCopy();
                                                setTimeout(handleClose, 500);
                                            }}
                                            className="flex-[2] py-3 bg-purple-500 hover:bg-purple-600 text-white font-medium shadow rounded-xl transition-colors flex items-center justify-center gap-2"
                                        >
                                            {copied ? <Check size={18} /> : <Copy size={18} />}
                                            Copy to Clipboard
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
