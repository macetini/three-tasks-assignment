// src/core/mvcs/mediators/PhoenixFlameMediator.ts
import { Graphics, type Texture } from "pixi.js";
import { AbstractMediator } from "../AbstractMediator";
import type { PhoenixFlameView } from "../components/PhoenixFlameView";

export class PhoenixFlameMediator extends AbstractMediator<PhoenixFlameView> {

    public override onRegister(): void {
        super.onRegister();

        // Pull the texture from your asset model
        // 1. Create a dummy "fire glow" texture procedurally
        const texture = this.createDummyFireTexture();

        this.view.setupFire(texture);

        // Hook into the Pixi Ticker for smooth 60fps animation
        this.app.ticker.add(this.onUpdate, this);
    }

    private createDummyFireTexture(): Texture {
        const g = new Graphics();

        // Draw a white circle with a "feathered" look using multiple layers or alpha
        // In Pixi v8, we can use fill with alpha
        g.circle(0, 0, 32).fill({ color: 0xffffff, alpha: 1 });

        // Convert the graphics object into a reusable texture
        const tex = this.app.renderer.generateTexture(g);

        // Cleanup the temporary graphics object
        g.destroy();

        return tex;
    }

    private onUpdate = (): void => {
        if (this.view) {
            this.view.update(this.app.ticker.deltaTime);
        }
    }

    public override onRemove(): void {
        this.app.ticker.remove(this.onUpdate, this);
        super.onRemove();
        // this.view.dispose() is called in super.onRemove or via Task switch logic
    }
}