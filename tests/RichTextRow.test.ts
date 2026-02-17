import { describe, test, expect, jest } from '@jest/globals';
import { Texture } from 'pixi.js';

jest.unstable_mockModule('pixi.js', () => import('./__mocks__/dummy.js' as any));

describe('RichTextRow', () => {
    test('should initialize', async () => {
        await jest.isolateModulesAsync(async () => {            
            const { RichTextParser } = await import('../src/core/mvcs/view/util/RichTextParser');
            const { RichTextRow } = await import('../src/core/mvcs/view/components/ui/RichTextRow');

            const mockVO = {
                characterName: 'Test',
                tokens: [{ type: RichTextParser.TEXT_TOKEN_TYPE, value: 'Hi' }]
            };

            const provider = () => new Texture();

            const row = new RichTextRow(mockVO as any, 'left' as any, provider);

            expect(row).toBeDefined();
            console.log("Test finished!");
        });
    });
});
