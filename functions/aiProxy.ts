import { checkRateLimit } from './rateLimiter';
import { buildAIConfig } from '../src/ai/aiConfig';
import { resolveProvider } from '../src/ai/providers';

/**
 * Mocks the Firebase HTTPS Callable function
 */
export const aiProxy = async (data: any, context?: any) => {
    // 1. Authenticate user
    const userId = context?.auth?.uid || 'anonymous';

    // 2. Check rate limits
    const allowed = await checkRateLimit(userId);
    if (!allowed) {
        throw new Error('Rate limit exceeded');
    }

    // 3. Resolve Provider
    const config = buildAIConfig();
    const provider = resolveProvider(config);

    // 4. Transform request and send to LLM
    try {
        const response = await provider.call(data);
        return { data: response };
    } catch (error: any) {
        console.error('LLM Error:', error);
        throw new Error(`AI error: ${error.message}`);
    }
}
