'use client';

import { useChat } from '@ai-sdk/react';

import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Loader2, Bot, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

interface ClarifyAssistantProps {
    taskText: string;
    onClose: () => void;
}

export function ClarifyAssistant({ taskText, onClose }: ClarifyAssistantProps) {
    const [inputValue, setInputValue] = useState('');
    const { messages, append, isLoading } = useChat({
        initialMessages: [
            {
                id: 'system-welc',
                role: 'assistant',
                content: `I noticed "${taskText}" looks a bit vague or big. In Getting Things Done, we need to know the successful outcome and the very next physical action. What does "done" look like for this?`
            } as any
        ]
    } as any) as any;

    const messagesEndRef = useRef<HTMLDivElement>(null);

    function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!inputValue.trim() || isLoading) return;

        append({
            role: 'user',
            content: inputValue
        });
        setInputValue('');
    }

    // Auto-scroll logic
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed inset-4 md:inset-auto md:top-[15%] md:left-1/2 md:-translate-x-1/2 md:w-[600px] md:h-[600px] bg-surface-base border border-border-default/50 rounded-3xl overflow-hidden shadow-glow-accent z-50 flex flex-col"
        >
            <div className="flex flex-col h-full bg-surface-body text-content-primary">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-border-default/50 bg-gradient-to-r from-surface-card to-surface-body flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="bg-indigo-500/10 p-2.5 rounded-2xl border border-indigo-500/20">
                            <Sparkles size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-display font-bold text-lg leading-tight">Clarify Coach</h3>
                            <p className="text-sm font-medium text-content-muted">Breaking things down together</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-surface-card rounded-full transition-colors text-content-muted hover:text-content-primary">
                        ✕
                    </button>
                </div>

                {/* Chat Log */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar bg-surface-body dark:bg-black/20">
                    <AnimatePresence initial={false}>
                        {messages.map((m: any) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${m.role === 'user'
                                        ? 'bg-indigo-600 text-white border-indigo-500 rounded-tr-sm'
                                        : 'bg-surface-card text-content-primary border-border-default rounded-tl-sm'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2 opacity-80">
                                        {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{m.role === 'user' ? 'You' : 'Coach'}</span>
                                    </div>
                                    <p className="text-sm md:text-base font-medium leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-surface-card border border-border-default rounded-2xl rounded-tl-sm p-4 flex items-center gap-3 text-content-muted text-sm font-medium">
                                <Loader2 size={16} className="animate-spin text-brand" /> Let me think...
                            </div>
                        </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-border-default bg-surface-card">
                    <form
                        onSubmit={handleSend}
                        className="relative flex items-center bg-surface-body focus-within:bg-surface-card border border-border-default focus-within:border-indigo-400 rounded-2xl px-4 py-1.5 transition-colors shadow-inner"
                    >
                        <input
                            value={inputValue}
                            onChange={e => setInputValue(e.target.value)}
                            placeholder="Type a response..."
                            autoFocus
                            disabled={isLoading}
                            className="flex-1 bg-transparent border-none focus:ring-0 py-3 text-content-primary placeholder-content-muted text-base font-medium"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !inputValue.trim()}
                            className="flex-shrink-0 text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 disabled:opacity-50 p-2 rounded-xl transition-all shadow-md active:scale-95 ml-2"
                        >
                            <Send size={16} />
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
