// tests/core/mvcs/view/util/RichTextParser.test.ts
import { describe, expect, it } from 'vitest';
import { RichTextParser } from '../../../../../src/core/mvcs/view/util/RichTextParser';

describe('RichTextParser', () => {

    it('should parse mixed text and emoji tags correctly', () => {
        const input = "Hello {smile} world {fire}";
        const tokens = RichTextParser.parse(input);

        expect(tokens).toEqual([
            { type: 'text', value: 'Hello ' },
            { type: 'emoji', value: 'smile' },
            { type: 'text', value: ' world ' },
            { type: 'emoji', value: 'fire' }
        ]);
    });

    it('should handle tags at the very beginning and end', () => {
        const input = "{star}Content{heart}";
        const tokens = RichTextParser.parse(input);

        expect(tokens).toHaveLength(3);
        expect(tokens[0]).toEqual({ type: 'emoji', value: 'star' });
        expect(tokens[1]).toEqual({ type: 'text', value: 'Content' });
        expect(tokens[2]).toEqual({ type: 'emoji', value: 'heart' });
    });

    it('should reset lastIndex correctly to allow multiple consecutive calls', () => {
        const input = "Testing {reset}";

        // Call it twice to ensure the internal regex state doesn't bleed over
        RichTextParser.parse(input);
        const secondRun = RichTextParser.parse(input);

        expect(secondRun).toHaveLength(2);
        expect(secondRun[1].value).toBe('reset');
    });

    it('should handle text with characters that resemble tags but do not match the regex', () => {
        // This tests if the substring logic correctly captures text around failures
        const input = "Wait {not_a_tag ... maybe } and {real_tag}";
        const tokens = RichTextParser.parse(input);

        // This depends on your TOKEN_REGEX. 
        // If the regex is strictly /\{(\w+)\}/g, it will treat the first part as text.
        const emojiTokens = tokens.filter(t => t.type === RichTextParser.EMOJI_TOKEN_TYPE);
        expect(emojiTokens.at(-1)?.value).toBe('real_tag');
    });

    it('should handle a string that is ONLY an emoji', () => {
        const tokens = RichTextParser.parse("{cool}");
        expect(tokens).toHaveLength(1);
        expect(tokens[0]).toEqual({ type: 'emoji', value: 'cool' });
    });
});