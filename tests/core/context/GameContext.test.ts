// tests/core/context/GameContext.test.ts
import { Application } from 'pixi.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GameContext } from '../../../src/core/context/GameContext';

describe('GameContext', () => {
    let app: Application;
    let context: GameContext;

    beforeEach(async () => {
        vi.restoreAllMocks();

        // Mock PIXI Application
        app = {
            stage: { addChild: vi.fn() },
            ticker: { add: vi.fn(), FPS: 60 },
            renderer: {}
        } as any;

        context = new GameContext(app);
    });

    it('should initialize infrastructure services on bootstrap', async () => {
        // Mock AssetService.init as it's the only async infrastructure call
        const assetInitSpy = vi.spyOn((context as any).assetService, 'init').mockResolvedValue(undefined);

        await context.bootstrap();

        expect(assetInitSpy).toHaveBeenCalled();
    });

    it('should map models, commands, and mediators during bootstrap', async () => {
        const modelMapSpy = vi.spyOn((context as any).modelMap, 'map');
        const commandMapSpy = vi.spyOn((context as any).commandMap, 'map');
        const mediatorMapSpy = vi.spyOn((context as any).mediatorMap, 'map');

        await context.bootstrap();

        // Check if models are mapped (CardModel, MagicWordsModel, FlameModel)
        expect(modelMapSpy).toHaveBeenCalledTimes(3);

        // Check if commands are mapped
        expect(commandMapSpy).toHaveBeenCalledTimes(3);

        // Check if mediators are mapped
        expect(mediatorMapSpy).toHaveBeenCalledTimes(5);
    });

    it('should initialize the RootView and attach it to the stage', async () => {
        const stageSpy = vi.spyOn(app.stage, 'addChild');
        const registerSpy = vi.spyOn((context as any).mediatorMap, 'register');

        await context.bootstrap();

        // Verify RootView was added
        expect(stageSpy).toHaveBeenCalled();
        // Verify RootView was registered for mediation
        expect(registerSpy).toHaveBeenCalled();
    });

    it('should add debug info if DEBUG config is true', async () => {
        // Force debug to true for the test
        (context as any).cfg.DEBUG = true;
        const tickerSpy = vi.spyOn(app.ticker, 'add');

        await context.bootstrap();

        expect(tickerSpy).toHaveBeenCalled();
        // Verify stage got the FPS text child
        expect(app.stage.addChild).toHaveBeenCalled();
    });
});