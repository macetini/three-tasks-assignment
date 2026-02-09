import { Container } from 'pixi.js';

export class SceneNavigator {
    private currentScene: Container | null = null;
    private readonly stage: Container;

    constructor(stage: Container) {
        this.stage = stage;
    }

    /**
     * Transitions to a new scene and cleans up the previous one.
     */
    public async goTo(scene: Container): Promise<void> {
        if (this.currentScene) {
            this.currentScene.removeFromParent();

            // Crucial for performance: destroy old scene and its children 
            this.currentScene.destroy({ children: true, texture: true });
        }

        this.currentScene = scene;
        this.stage.addChild(this.currentScene);
    }
}