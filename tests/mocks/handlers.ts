import { http, HttpResponse } from 'msw';

export const handlers = [
    // Firebase Auth
    http.post('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword', () => {
        return HttpResponse.json({
            idToken: 'mock-id-token',
            refreshToken: 'mock-refresh-token',
            expiresIn: '3600',
            localId: 'mock-user-id',
        });
    }),

    // Anthropic API (AI)
    http.post('https://api.anthropic.com/v1/messages', async ({ request }) => {
        const body: any = await request.json();

        // Mock Smart Capture response
        if (body.messages[0].content.includes('tomorrow')) {
            return HttpResponse.json({
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        title: 'Email boss',
                        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                        context: 'work',
                        confidence: 0.9,
                    }),
                }],
            });
        }

        // Mock Brain Dump response
        if (body.messages[0].content.includes('brain dump')) {
            return HttpResponse.json({
                content: [{
                    type: 'text',
                    text: JSON.stringify({
                        tasks: [
                            { title: 'Task 1', confidence: 0.9 },
                            { title: 'Task 2', confidence: 0.85 },
                            { title: 'Task 3', confidence: 0.8 },
                        ],
                    }),
                }],
            });
        }

        // Default AI response
        return HttpResponse.json({
            content: [{
                type: 'text',
                text: 'Mock AI response',
            }],
        });
    }),

    // Stripe
    http.post('https://api.stripe.com/v1/checkout/sessions', () => {
        return HttpResponse.json({
            id: 'cs_test_123',
            url: 'https://checkout.stripe.com/pay/cs_test_123',
        });
    }),
];
