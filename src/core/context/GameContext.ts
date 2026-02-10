// src/core/context/GameContext.ts
import { Application } from 'pixi.js';
import { AssetService } from '../mvcs/service/AssetService';
import { AceOfShadowsView } from '../mvcs/view/component/AceOfShadowsView';
import { MainMenuView } from '../mvcs/view/component/MainMenuView';
import { RootView } from '../mvcs/view/component/RootView';
import { MainMenuMediator } from '../mvcs/view/mediator/MainMenuMediator';
import { RootViewMediator } from '../mvcs/view/mediator/RootViewMediator';
import { MediatorMap } from '../mvcs/view/MediatorMap';
import { SignalBus } from '../signal/SignalBus';
import { AceOfShadowsMediator } from '../mvcs/view/mediator/AceOfShadowsMediator';

export class GameContext {
    private readonly app: Application;
    private readonly assetService: AssetService;
    private readonly signalBus: SignalBus;

    private readonly mediatorMap: MediatorMap;

    constructor(app: Application) {
        this.app = app;
        this.assetService = new AssetService();
        this.signalBus = new SignalBus();
        this.mediatorMap = new MediatorMap(this.app, this.assetService, this.signalBus);
    }

    public async bootstrap() {
        console.log("[GameContext] Bootstrapping services...");
    
        const rootView = new RootView();
        rootView.init();
        this.app.stage.addChild(rootView);

        // Mapping        
        this.mediatorMap.map(RootView, RootViewMediator);
        this.mediatorMap.map(MainMenuView, MainMenuMediator);
        this.mediatorMap.map(AceOfShadowsView, AceOfShadowsMediator);
        //

        this.mediatorMap.register(rootView);
    }
}