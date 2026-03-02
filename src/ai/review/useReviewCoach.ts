'use client';
import { useState, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { streamReviewCoachResponse } from './ReviewCoach';
import type { ReviewWeekData, ConversationMessage } from './ReviewCoach';
import type { Locale } from '@/i18n/config';
import { useAI } from '../useAI';

const MAX_TURNS = 8;

export function useReviewCoach(weekData: ReviewWeekData) {
  const locale = useLocale() as Locale;
  const { isAvailable } = useAI();
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(async (userContent: string) => {
    if (!isAvailable || isStreaming) return;
    if (messages.filter((m) => m.role === 'user').length >= MAX_TURNS) return;

    const userMsg: ConversationMessage = { role: 'user', content: userContent, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setIsStreaming(true);
    setStreamingContent('');
    setError(null);

    try {
      let fullContent = '';
      for await (const delta of streamReviewCoachResponse(locale, weekData, messages, userContent)) {
        fullContent += delta;
        setStreamingContent(fullContent);
      }
      const coachMsg: ConversationMessage = { role: 'coach', content: fullContent, timestamp: Date.now() };
      setMessages((prev) => [...prev, coachMsg]);
      setStreamingContent('');
    } catch (e) {
      setError(String(e));
    } finally {
      setIsStreaming(false);
    }
  }, [isAvailable, isStreaming, messages, weekData]);

  const startCoaching = useCallback(async () => {
    await sendMessage('Start the review coaching session.');
  }, [sendMessage]);

  const reset = useCallback(() => {
    setMessages([]);
    setStreamingContent('');
    setError(null);
  }, []);

  const turnCount = messages.filter((m) => m.role === 'user').length;
  const isAtLimit = turnCount >= MAX_TURNS;

  return { messages, streamingContent, isStreaming, error, sendMessage, startCoaching, reset, turnCount, isAtLimit };
}
