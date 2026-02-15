import { describe, test, expect } from '@jest/globals';
import { RichTextParser } from '../src/core/mvcs/view/util/RichTextParser';

describe('RichTextParser', () => {
    test('should parse plain text without tokens', () => {
        const input = "Hello world";
        const result = RichTextParser.parse(input);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ type: 'text', value: 'Hello world' });
    });

    test('should parse string with single emoji token', () => {
        // Assuming regex is /{([^}]+)}/g from GameConfig
        const input = "Hello {smile}!";
        const result = RichTextParser.parse(input);

        expect(result).toHaveLength(3);
        expect(result[0]).toEqual({ type: 'text', value: 'Hello ' });
        expect(result[1]).toEqual({ type: 'emoji', value: 'smile' });
        expect(result[2]).toEqual({ type: 'text', value: '!' });
    });

    test('should handle emoji at the start and end', () => {
        const input = "{fire}Hot{fire}";
        const result = RichTextParser.parse(input);

        expect(result).toHaveLength(3);
        expect(result[0].type).toBe('emoji');
        expect(result[1].value).toBe('Hot');
        expect(result[2].type).toBe('emoji');
    });

    test('should handle consecutive emojis', () => {
        const input = "{heart}{heart}";
        const result = RichTextParser.parse(input);

        expect(result).toHaveLength(2);
        expect(result[0].value).toBe('heart');
        expect(result[1].value).toBe('heart');
    });
});