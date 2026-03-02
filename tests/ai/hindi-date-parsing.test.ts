import { buildSmartCapturePrompt } from '../../src/ai/prompts/smartCapture';

describe('AI Smart Capture - Hindi Date Parsing Context Generation', () => {
    test('injects Hindi instructions correctly', () => {
        const prompt = buildSmartCapturePrompt('hi', [], [], '2026-03-02');

        expect(prompt).toContain('Respond in Hindi (हिन्दी)');
        expect(prompt).toContain('Hinglish');
        expect(prompt).toContain('परसों');
        expect(prompt).toContain('अगले सोमवार');
    });

    test('maintains English instructions correctly for default', () => {
        const prompt = buildSmartCapturePrompt('en', [], [], '2026-03-02');

        expect(prompt).toContain('Respond in English.');
        expect(prompt).not.toContain('परसों');
    });
});
