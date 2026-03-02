import { describe, test, expect } from 'vitest';
import { buildBrainDumpPrompt } from '@/ai/prompts/brainDump';
import { buildSmartCapturePrompt } from '@/ai/prompts/smartCapture';
import { buildSocraticClarifyPrompt } from '@/ai/prompts/socraticClarify';
import { Locale } from '@/i18n/config';

describe('AI Prompt Snapshot Tests', () => {
    describe('Brain Dump Prompt', () => {
        test('matches snapshot with contexts and projects', () => {
            const prompt = buildBrainDumpPrompt(['@home', '@office'], ['Website Redesign'], '2026-03-02');
            expect(prompt).toMatchSnapshot();
        });

        test('matches snapshot without contexts or projects', () => {
            const prompt = buildBrainDumpPrompt([], [], '2026-03-02');
            expect(prompt).toMatchSnapshot();
        });
    });

    describe('Smart Capture Prompt', () => {
        test('matches snapshot for English locale', () => {
            const prompt = buildSmartCapturePrompt('en' as Locale, ['@errands'], [], '10:00 AM', 'Developer');
            expect(prompt).toMatchSnapshot();
        });

        test('matches snapshot for Hindi locale', () => {
            const prompt = buildSmartCapturePrompt('hi' as Locale, ['@घर'], ['दिवाली की तैयारी'], '14:30 PM', 'Student');
            expect(prompt).toMatchSnapshot();
        });

        test('matches snapshot with defaults when role omitted', () => {
            const prompt = buildSmartCapturePrompt('en' as Locale, [], [], '08:00 AM');
            expect(prompt).toMatchSnapshot();
        });
    });

    describe('Socratic Clarify Prompt', () => {
        test('matches snapshot with existing contexts', () => {
            const prompt = buildSocraticClarifyPrompt(['@deepwork', '@computer', '@calls']);
            expect(prompt).toMatchSnapshot();
        });

        test('matches snapshot with no contexts provided', () => {
            const prompt = buildSocraticClarifyPrompt([]);
            expect(prompt).toMatchSnapshot();
        });
    });
});
