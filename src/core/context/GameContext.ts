// src/core/context/GameContext.ts
import { Application } from 'pixi.js';
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
import { RootView } from '../mvcs/view/components/RootView';
import { MediatorMap } from '../mvcs/view/MediatorMap';
import { AceOfShadowsMediator } from '../mvcs/view/mediators/AceOfShadowsMediator';
import { MagicWordsMediator } from '../mvcs/view/mediators/MagicWordsMediator';
import { MainMenuMediator } from '../mvcs/view/mediators/MainMenuMediator';
import { RootViewMediator } from '../mvcs/view/mediators/RootViewMediator';
import { SignalBus } from '../signal/SignalBus';
import { SignalType } from '../signal/type/SignalType';

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
        this.mediatorMap = new MediatorMap(this.app, this.signalBus);
        this.modelMap = new ModelMap();
        
        // NOTE: Three constructor arguments is a bit too much. 
        // Less would be better, but I believe this is a bit more readable.
        this.commandMap = new CommandMap(this.signalBus, this.assetService, this.modelMap);
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
        this.commandMap.map(SignalType.PREPARE_CARDS, PrepareCardsCommand);
        this.commandMap.map(SignalType.FETCH_MAGIC_WORDS, FetchMagicWordsCommand);

        // --- View & Mediator Mapping ---  
        console.log("[GameContext] View & Mediator Mapping.");
        this.mediatorMap.map(RootView, RootViewMediator);
        this.mediatorMap.map(MainMenuView, MainMenuMediator);
        this.mediatorMap.map(AceOfShadowsView, AceOfShadowsMediator);
        this.mediatorMap.map(MagicWordsView, MagicWordsMediator);
        //        

        // --- Initialization ---
        console.log("[GameContext] Initialization.");
        const rootView = new RootView();
        rootView.init();
        this.app.stage.addChild(rootView);
        this.mediatorMap.register(rootView);

        console.log("[GameContext] Bootstrap Finished.");
    }
}