/// <reference types="vitest" />
import { FreeCaptureParser } from './capture/FreeCaptureParser';

describe('NLPParser', () => {

    it('parses simple text', () => {
        const res = parseTaskOffline('Buy milk');
        expect(res.cleanText).toBe('Buy milk');
        expect(res.dueDate).toBeNull();
        expect(res.projects).toEqual([]);
        expect(res.contexts).toEqual([]);
    });

    it('extracts contexts with @', () => {
        const res = parseTaskOffline('Buy milk @grocery');
        expect(res.cleanText).toBe('Buy milk');
        expect(res.contexts).toEqual(['grocery']);
    });

    it('extracts projects with #', () => {
        const res = parseTaskOffline('Draft charter #ProjectApollo');
        expect(res.cleanText).toBe('Draft charter');
        expect(res.projects).toEqual(['ProjectApollo']);
    });

    it('extracts dates using chrono', () => {
        const res = parseTaskOffline('Call Mom tomorrow at 5pm');
        expect(res.cleanText.trim()).toBe('Call Mom');
        // Because 'tomorrow at 5pm' is relative, we just ensure it parsed a date
        expect(res.dueDate).toBeInstanceOf(Date);
    });

    it('handles multiple tags and dates simultaneously', () => {
        const res = parseTaskOffline('Review PR next friday #Work @Computer');
        expect(res.cleanText).toBe('Review PR');
        expect(res.projects).toEqual(['Work']);
        expect(res.contexts).toEqual(['Computer']);
        expect(res.dueDate).toBeInstanceOf(Date);
    });

    it('handles quoted tags with spaces', () => {
        const res = parseTaskOffline('Call contractor @"Home Depot" #"Home Renovation"');
        expect(res.cleanText).toBe('Call contractor');
        expect(res.contexts).toEqual(['Home Depot']);
        expect(res.projects).toEqual(['Home Renovation']);
    });
});
