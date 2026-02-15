import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Point the mock to your new file
jest.unstable_mockModule('pixi.js', () => import('./__mocks__/pixi.js'));

// Dynamic imports
const { Assets, Cache } = await import('pixi.js');
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
    });

    test('getTexture should return from cache', () => {
        (Cache.has as any).mockReturnValue(true);
        const result = service.getTexture('hero');
        expect(result).toBeDefined();
    });

    test('getCards should call generator methods', async () => {
        const genSpy = jest.spyOn(service['cardsGenerator'], 'bakeCardTextures')
            .mockResolvedValue([]);
        const result = await service.getCards(mockRenderer);
        expect(Array.isArray(result)).toBe(true);
        expect(genSpy).toHaveBeenCalled();
    });
});