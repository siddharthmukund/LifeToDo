'use client';
import { useEffect, useRef, useState } from 'react';
import { Send, Brain, MessageCircle } from 'lucide-react';
import { useReviewCoach } from './useReviewCoach';
import type { ReviewWeekData } from './ReviewCoach';

interface Props {
  weekData: ReviewWeekData;
  isADHDMode?: boolean;
}

export function ReviewCoachChat({ weekData, isADHDMode = false }: Props) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages, streamingContent, isStreaming, error,
    sendMessage, startCoaching, turnCount, isAtLimit,
  } = useReviewCoach(weekData);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingContent]);

  async function handleOpen() {
    setIsOpen(true);
    if (messages.length === 0) await startCoaching();
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput('');
    await sendMessage(text);
  }

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="flex items-center gap-2 px-4 py-2.5 border border-primary/40 text-primary rounded-xl text-sm hover:bg-primary/5 transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        {isADHDMode ? 'Need help?' : 'Chat with AI Coach'}
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-border-subtle bg-surface-card overflow-hidden flex flex-col h-80">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-subtle bg-surface-base">
        <Brain className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-content-primary">AI Coach</span>
        <span className="ml-auto text-[10px] text-content-muted">{turnCount}/{8} turns</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
              m.role === 'user'
                ? 'bg-primary text-white'
                : 'bg-surface-base border border-border-subtle text-content-primary'
            }`}>
              {m.content}
            </div>
          </div>
        ))}

        {isStreaming && streamingContent && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-xl px-3 py-2 bg-surface-base border border-border-subtle text-sm text-content-primary">
              {streamingContent}
              <span className="inline-block w-1 h-3 bg-primary/60 ml-0.5 animate-pulse" />
            </div>
          </div>
        )}

        {isStreaming && !streamingContent && (
          <div className="flex justify-start">
            <div className="flex gap-1 px-3 py-2">
              {[0, 1, 2].map((i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-content-muted animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-xs text-status-danger text-center">{error}</p>}
        {isAtLimit && (
          <p className="text-xs text-content-muted text-center italic">
            You&apos;ve had a great coaching session — time to wrap up your review!
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {!isAtLimit && (
        <div className="flex items-center gap-2 p-2 border-t border-border-subtle">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && void handleSend()}
            placeholder="Reply to coach…"
            disabled={isStreaming}
            className="flex-1 px-3 py-1.5 bg-surface-base border border-border-default rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="p-1.5 bg-primary text-white rounded-lg disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
