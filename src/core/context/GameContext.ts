// src/core/context/GameContext.ts
import { Application, Text } from 'pixi.js';
import { GameConfig } from '../config/GameConfig';
import { CommandMap } from '../mvcs/controller/CommandMap';
import { FetchMagicWordsCommand } from '../mvcs/controller/commands/FetchMagicWordsCommand';
import { PrepareCardsCommand } from '../mvcs/controller/commands/PrepareCardsCommand';
import { PrepareFlameCommand } from '../mvcs/controller/commands/PrepareFlameCommand';
import { ModelMap } from '../mvcs/model/ModelMap';
import { CardModel } from '../mvcs/model/states/CardModel';
import { FlameModel } from '../mvcs/model/states/FlameModel';
import { MagicWordsModel } from '../mvcs/model/states/MagicWordsModel';
import { AssetService } from '../mvcs/service/AssetService';
import { AceOfShadowsView } from '../mvcs/view/components/AceOfShadowsView';
import { MagicWordsView } from '../mvcs/view/components/MagicWordsView';
import { MainMenuView } from '../mvcs/view/components/MainMenuView';
import { PhoenixFlameView } from '../mvcs/view/components/PhoenixFlameView';
import { RootView } from '../mvcs/view/components/RootView';
import { MediatorMap } from '../mvcs/view/MediatorMap';
import { AceOfShadowsMediator } from '../mvcs/view/mediators/AceOfShadowsMediator';
import { MagicWordsMediator } from '../mvcs/view/mediators/MagicWordsMediator';
import { MainMenuMediator } from '../mvcs/view/mediators/MainMenuMediator';
import { PhoenixFlameMediator } from '../mvcs/view/mediators/PhoenixFlameMediator';
import { RootViewMediator } from '../mvcs/view/mediators/RootViewMediator';
import { ModelSignals } from '../signal/ModelSignals';
import { SignalBus } from '../signal/SignalBus';

/**
 * The GameContext is the Composition Root of the application.
 * It is responsible for initializing the MVCS layers, mapping dependencies,
 * and bootstrapping the core application lifecycle.
 */
export class GameContext {
    private readonly cfg = GameConfig.GLOBAL;

    private readonly app: Application;
    private readonly assetService: AssetService;
    private readonly signalBus: SignalBus;

    private readonly mediatorMap: MediatorMap;
    private readonly modelMap: ModelMap;
    private readonly commandMap: CommandMap;

    /**
     * Constructor for the GameContext class.
     * Initializes the asset service, signal bus, model map, command map, and mediator map.
     * 
     * @param app - The Application instance, used for rendering.
     */
    constructor(app: Application) {
        this.app = app;

        this.assetService = new AssetService();
        this.signalBus = new SignalBus();
        this.modelMap = new ModelMap();

        // NOTE: Three constructor arguments is a bit much. 
        // Less would be better, but I believe this is a bit more readable.
        // For anything more than THREE (My Opinion) refactoring is required.
        this.commandMap = new CommandMap(this.signalBus, this.assetService, this.modelMap);

        // NOTE: I have decided to pass the model map to the mediator map.
        // Each mediator will have a reference to the model map.
        // While this is against the principles of MVCS (it couples too tightly Model and View),
        // in my opinion the benefits outweigh the drawbacks. It allows for a more efficient memory usage.
        // The data doesn't have to be transferred through the signal bus.
        // The View will access it directly form Model after update notification.
        this.mediatorMap = new MediatorMap(this.app, this.signalBus, this.modelMap);
    }

    /**
     * Bootstraps the game context by initializing the asset service, mapping models, commands, views, and mediators.
     * This function is responsible for setting up the MVCS architecture and should be called once the application is ready.
     * It is an asynchronous function and should be called with the await keyword.
     */
    public async bootstrap(): Promise<void> {
        console.log("[GameContext] Bootstrap Started.");

        // 1. Infrastructure Services
        await this.assetService.init();

        // 2. MVCS Layer Setup
        this.mapModels();
        this.mapCommands();
        this.mapMediators();

        // 3. Application Entry Point
        this.initializeRootView();

        // 4. Developer HUD
        if (this.cfg.DEBUG) {
            this.addDebugInfo();
        }

        console.log("[GameContext] Bootstrap Finished.");
    }

    /**
     * Registers singleton model instances for global state management.
     */
    private mapModels(): void {
        console.log("[GameContext] Mapping Models...");
        this.modelMap.map(CardModel.NAME, new CardModel());
        this.modelMap.map(MagicWordsModel.NAME, new MagicWordsModel());
        this.modelMap.map(FlameModel.NAME, new FlameModel());
    }

    /**
     * Maps global signals to their respective business logic Commands.
     */
    private mapCommands(): void {
        console.log("[GameContext] Mapping Commands...");
        this.commandMap.map(ModelSignals.PREPARE_CARDS, PrepareCardsCommand);
        this.commandMap.map(ModelSignals.FETCH_MAGIC_WORDS, FetchMagicWordsCommand);
        this.commandMap.map(ModelSignals.PREPARE_FLAME, PrepareFlameCommand);
    }

    /**
     * Defines the relationship between Display Objects and their Mediators.
     */
    private mapMediators(): void {
        console.log("[GameContext] Mapping Mediators...");
        this.mediatorMap.map(RootView, RootViewMediator);
        this.mediatorMap.map(MainMenuView, MainMenuMediator);
        this.mediatorMap.map(AceOfShadowsView, AceOfShadowsMediator);
        this.mediatorMap.map(MagicWordsView, MagicWordsMediator);
        this.mediatorMap.map(PhoenixFlameView, PhoenixFlameMediator);
    }

    /**
     * Instantiates the Root container and attaches it to the Pixi Stage.
     */
    private initializeRootView(): void {
        console.log("[GameContext] Initializing Root Display...");
        const rootView = new RootView();

        // RootView initialization
        rootView.init();
        this.app.stage.addChild(rootView);

        // Registering with the mediator map triggers the RootViewMediator
        this.mediatorMap.register(rootView);
    }

    private addDebugInfo(): void {
        const textTemplate = "FPS: %1 Avg: %2";
        const fpsText: Text = new Text({
            text: textTemplate.replace("%1", "0").replace("%2", "0"),
            style: { fill: 0xffffff, fontSize: 16, fontWeight: 'bold' }
        });

        fpsText.x = fpsText.y = 10;
        this.app.stage.addChild(fpsText);

        const samples: number[] = [];
        const maxSamples = 60;

        this.app.ticker.add(() => {
            const currentFPS = this.app.ticker.FPS;

            samples.push(currentFPS);
            if (samples.length > maxSamples) {
                samples.shift(); // Remove oldest
            }

            const sum = samples.reduce((a, b) => a + b, 0);
            const avgFPS = Math.round(sum / samples.length);

            fpsText.text = textTemplate
                .replace("%1", Math.round(currentFPS).toString())
                .replace("%2", avgFPS.toString());

            if (currentFPS < 20) fpsText.style.fill = 0xff4444; // Red
            else if (currentFPS < 40) fpsText.style.fill = 0xffaa00; // Orange
            else fpsText.style.fill = 0x00ff00; // Green
        });
    }
}