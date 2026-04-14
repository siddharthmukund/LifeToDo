'use client';

import { useChat } from '@ai-sdk/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cpu, Loader2, Bot, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** A sidebar/slide-out component meant for continuous weekly review coaching. */
export function ReviewChat() {
    const [inputValue, setInputValue] = useState('');
    const { messages, append, isLoading } = useChat({
        initialMessages: [
            {
                id: 'system-review',
                role: 'assistant',
                content: `Let's begin your Weekly Review. First phase: **Get Clear**. Empty your head of everything that has your attention right now—projects, worries, things you're waiting on. Just brain-dump them here.`
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

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex flex-col h-full bg-surface-body text-content-primary">
            {/* Header */}
            <div className="p-4 border-b border-border-default/50 bg-gradient-to-r from-surface-card to-surface-body flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl border border-primary/20">
                    <Cpu size={18} className="text-primary-ink" />
                </div>
                <div>
                    <h3 className="font-display font-bold text-sm">Review Coach</h3>
                    <p className="text-xs text-content-muted">Guiding your GTD sweep</p>
                </div>
            </div>

            {/* Chat Log */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-surface-base">
                <AnimatePresence initial={false}>
                    {messages.map((m: any) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm border ${m.role === 'user'
                                    ? 'bg-primary text-on-brand border-primary/50 rounded-tr-sm'
                                    : 'bg-surface-card text-content-primary border-border-default rounded-tl-sm'
                                }`}>
                                <div className="flex items-center gap-2 mb-1.5 opacity-80">
                                    {m.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{m.role === 'user' ? 'You' : 'Coach'}</span>
                                </div>
                                <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                            </div>
                        </motion.div>
                    ))}

                    {isLoading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex justify-start"
                        >
                            <div className="bg-surface-card border border-border-default rounded-2xl rounded-tl-sm p-4 flex items-center gap-2 text-content-muted text-sm font-medium">
                                <Loader2 size={14} className="animate-spin text-primary-ink" /> Processing...
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-border-default bg-surface-card">
                <form
                    onSubmit={handleSend}
                    className="relative flex items-center bg-surface-body focus-within:bg-surface-card border border-border-default focus-within:border-primary/50 rounded-2xl px-3 py-1.5 transition-colors shadow-inner"
                >
                    <input
                        type="text"
                        value={inputValue}
                        onChange={e => setInputValue(e.target.value)}
                        placeholder="Message your coach..."
                        disabled={isLoading}
                        className="flex-1 bg-transparent border-none focus:ring-0 py-2.5 text-content-primary placeholder-content-muted text-sm font-medium"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !inputValue.trim()}
                        className="flex-shrink-0 text-on-brand bg-primary hover:bg-primary/90 disabled:opacity-30 p-2 rounded-xl transition-all shadow-md active:scale-95 ml-2"
                    >
                        <Send size={14} />
                    </button>
                </form>
            </div>
        </div>
    );
}
