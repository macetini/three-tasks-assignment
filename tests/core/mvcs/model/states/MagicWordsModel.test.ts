// tests/core/mvcs/model/states/MagicWordsModel.test.ts
import { beforeEach, describe, expect, it } from 'vitest';
import { GameConfig } from '../../../../../src/core/config/GameConfig';
import { MagicWordsModel } from '../../../../../src/core/mvcs/model/states/MagicWordsModel';
import { MagicWordVO } from '../../../../../src/core/mvcs/model/states/vo/MagicWordVO';

describe('MagicWordsModel', () => {
    let model: MagicWordsModel;

    beforeEach(() => {
        model = new MagicWordsModel();
    });

    describe('Avatar Positions', () => {
        it('should store and retrieve avatar positions', () => {
            model.setAvatarData([
                { name: 'Alice', position: 'left' },
                { name: 'Bob', position: 'right' }
            ]);

            expect(model.getPosition('Alice')).toBe('left');
            expect(model.getPosition('Bob')).toBe('right');
        });

        it('should return default position from GameConfig for unknown characters', () => {
            // Ensure no data is set
            expect(model.getPosition('Unknown')).toBe(GameConfig.WORDS.DEFAULT_AVATAR_POSITION);
        });
    });

    describe('Dialogue Data', () => {
        it('should store and retrieve dialogue words', () => {
            const mockData = [
                new MagicWordVO('Alice', 'Hello [smile]'),
                new MagicWordVO('Bob', 'Hi there!')
            ];

            model.setData(mockData);
            expect(model.words).toBe(mockData);
            expect(model.words.length).toBe(2);
        });
    });

    describe('Texture Management', () => {
        it('should retrieve specific textures and fallback to default', () => {
            const mockDefault = { label: 'default_tex' } as any;
            const mockEmoji = { label: 'smile_tex' } as any;

            const textureMap = new Map();
            textureMap.set('default', mockDefault);
            textureMap.set('smile', mockEmoji);

            model.setTextures(textureMap);

            // Found
            expect(model.getTexture('smile')).toBe(mockEmoji);
            // Fallback
            expect(model.getTexture('missing_id')).toBe(mockDefault);
        });
    });
});