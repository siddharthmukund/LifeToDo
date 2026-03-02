// Core AI service exports
export { callAIProxy, callAIProxyStream } from './aiProxy';
export { callAI, streamAI } from './aiService';
export { AI_CONFIG, FEATURE_TEMPERATURES } from './aiConfig';
export { getAIConsent, grantAIConsent, revokeAIConsent, hasAIConsent, getProviderDisplayName } from './aiConsent';
export { useAI, useAICall } from './useAI';
export { useAIConsent } from './useAIConsent';
export type { AIRequest, AIResponse, AIStreamChunk, AIContext, AIFeature, TaskSummary, JSONSchema } from './types';
export { AIError } from './types';

// Feature modules
export * from './capture';
export * from './clarify';
export * from './organize';
export * from './review';
export * from './engage';
