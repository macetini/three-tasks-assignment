// src/core/context/GameContext.ts
import { Application } from 'pixi.js';
import { SceneNavigator } from '../SceneNavigator';
import { AssetService } from '../mvcs/service/AssetService';
import { AceOfShadowsView } from '../mvcs/views/AceOfShadowsView';

export class GameContext {
    private readonly app: Application;
    private readonly assetService: AssetService;
    private readonly navigator: SceneNavigator;

    //private currentState: GameState = GameState.BOOTSTRAP;

    constructor(app: Application) {
        this.app = app;
        this.assetService = new AssetService();
        this.navigator = new SceneNavigator(app.stage);
    }

    public async bootstrap() {
        console.log("[GameContext] Bootstrapping services...");
        await this.assetService.init(this.app.renderer);

        const view: AceOfShadowsView = new AceOfShadowsView(this.assetService);
        this.app.stage.addChild(view);
    }
}