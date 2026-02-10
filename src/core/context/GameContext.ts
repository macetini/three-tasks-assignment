// src/core/context/GameContext.ts
import { Application } from 'pixi.js';
import { AssetService } from '../mvcs/service/AssetService';
import { RootViewMediator } from '../mvcs/view/mediator/RootViewMediator';
import { MediatorMap } from '../mvcs/view/MediatorMap';
import { RootView } from '../mvcs/view/component/RootView';
import { MainMenuView } from '../mvcs/view/component/MainMenuView';
import { MainMenuMediator } from '../mvcs/view/mediator/MainMenuMediator';

export class GameContext {
    private readonly app: Application;
    private readonly assetService: AssetService;

    private readonly mediatorMap: MediatorMap;

    constructor(app: Application) {
        this.app = app;
        this.assetService = new AssetService();
        this.mediatorMap = new MediatorMap(this.assetService);
    }

    public async bootstrap() {
        console.log("[GameContext] Bootstrapping services...");
        await this.assetService.init(this.app.renderer);

        const rootView = new RootView();
        rootView.init();
        this.app.stage.addChild(rootView);

        // Mapping        
        this.mediatorMap.map(RootView, RootViewMediator);
        this.mediatorMap.map(MainMenuView, MainMenuMediator);

        this.mediatorMap.register(rootView);
    }
}