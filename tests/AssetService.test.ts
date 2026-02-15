import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// 1. Virtual mock covering ALL required exports from pixi.js
jest.unstable_mockModule('pixi.js', () => ({
    __esModule: true,
    Color: class {
        static from() { return {}; }
        setValue() { return this; }
    },
    Graphics: class {
        // All drawing methods must return 'this' for chaining
        roundRect() { return this; }
        rect() { return this; }
        moveTo() { return this; }
        lineTo() { return this; }
        closePath() { return this; }
        clear() { return this; }
        fill() { return this; }
        stroke() { return this; }
        circle() { return this; }
        poly() { return this; }
        destroy() { }
    },
    Assets: {
        init: jest.fn(() => Promise.resolve()),
        load: jest.fn()
    },
    Cache: {
        has: jest.fn(),
        get: jest.fn()
    },
    Texture: {
        from: jest.fn(() => ({ destroy: jest.fn() })),
        EMPTY: {}
    },
    Sprite: class {
        destroy = jest.fn();
        anchor = { set: jest.fn() };
    },
    Container: class {
        addChild = jest.fn();
        removeChildren = jest.fn();
        destroy = jest.fn();
    },
    extensions: { add: jest.fn() },
    ExtensionType: { LoadParser: 1 }
}), { virtual: true });

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