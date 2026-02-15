import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Assets, Cache } from 'pixi.js';

// 1. Tell Jest to use dummy.js when anything asks for 'pixi.js'
jest.unstable_mockModule('pixi.js', () =>
    // This cast to 'any' tells TS: "Don't look for a module definition, just import the file"
    import('./__mocks__/dummy.js' as any)
);

const { AssetService } = await import('../src/core/mvcs/service/AssetService');

describe('AssetService', () => {
    let service: any;
    let mockRenderer: any;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AssetService();

        (Assets.init as any).mockResolvedValue(undefined);

        mockRenderer = {
            render: jest.fn(),
            generateTexture: jest.fn(() => ({
                destroy: jest.fn(),
                valid: true
            }))
        };
    });

    test('loadRemoteTexture should return texture on success', async () => {
        const mockTex = { id: 'test-tex' };
        (Assets.load as any).mockResolvedValue(mockTex);

        const result = await service.loadRemoteTexture('avatar', 'url');

        expect(result).toBe(mockTex);
        expect(Assets.load).toHaveBeenCalled();
    });

    test('getTexture should return from cache', () => {
        (Cache.has as any).mockReturnValue(true);

        const result = service.getTexture('hero');

        expect(result).toBeDefined();
        expect(Cache.has).toHaveBeenCalledWith('hero');
    });

    test('getCards should call generator methods', async () => {
        // Ensure mockRenderer has the function
        mockRenderer.generateTexture = jest.fn(() => ({
            destroy: jest.fn(),
            valid: true
        }));

        // Spy on the generator's bake method
        const genSpy = jest.spyOn(service['cardsGenerator'], 'bakeCardTextures')
            .mockResolvedValue([]);

        // PASS THE MOCK RENDERER HERE
        const result = await service.getCards(mockRenderer);

        expect(Array.isArray(result)).toBe(true);
        expect(genSpy).toHaveBeenCalled();
    });
});