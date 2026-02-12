// src/core/context/GameContext.ts
import { Application, Text } from 'pixi.js';
import { CommandMap } from '../mvcs/controller/CommandMap';
import { FetchMagicWordsCommand } from '../mvcs/controller/commands/FetchMagicWordsCommand';
import { PrepareCardsCommand } from '../mvcs/controller/commands/PrepareCardsCommand';
import { ModelMap } from '../mvcs/model/ModelMap';
import { CardModel } from '../mvcs/model/states/CardModel';
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
import { SignalBus } from '../signal/SignalBus';
import { ModelSignal } from '../signal/type/ModelSignal';

export class GameContext {
    private readonly app: Application;
    private readonly assetService: AssetService;
    private readonly signalBus: SignalBus;

    private readonly mediatorMap: MediatorMap;
    private readonly modelMap: ModelMap;
    private readonly commandMap: CommandMap;

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

    public async bootstrap() {
        console.log("[GameContext] Bootstrap Started.");

        await this.assetService.init();

        // --- Model Mapping ---
        console.log("[GameContext] Model Mapping.");
        this.modelMap.map(CardModel.NAME, new CardModel());
        this.modelMap.map(MagicWordsModel.NAME, new MagicWordsModel());

        // --- Command Mapping --- 
        console.log("[GameContext] Command Mapping.");
        this.commandMap.map(ModelSignal.PREPARE_CARDS, PrepareCardsCommand);
        this.commandMap.map(ModelSignal.FETCH_MAGIC_WORDS, FetchMagicWordsCommand);

        // --- View & Mediator Mapping ---  
        console.log("[GameContext] View & Mediator Mapping.");
        this.mediatorMap.map(RootView, RootViewMediator);
        this.mediatorMap.map(MainMenuView, MainMenuMediator);
        this.mediatorMap.map(AceOfShadowsView, AceOfShadowsMediator);
        this.mediatorMap.map(MagicWordsView, MagicWordsMediator);
        this.mediatorMap.map(PhoenixFlameView, PhoenixFlameMediator);
        //        

        // --- Initialization ---
        console.log("[GameContext] Initialization.");
        const rootView = new RootView();
        rootView.init();
        this.app.stage.addChild(rootView);
        this.mediatorMap.register(rootView);

        this.addDebugInfo();

        console.log("[GameContext] Bootstrap Finished.");
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