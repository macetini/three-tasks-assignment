// src/core/mvcs/mediators/PhoenixFlameMediator.ts
import { Graphics, type Texture } from "pixi.js";
import { AbstractMediator } from "../AbstractMediator";
import type { PhoenixFlameView } from "../components/PhoenixFlameView";

export class PhoenixFlameMediator extends AbstractMediator<PhoenixFlameView> {

    public override onRegister(): void {
        super.onRegister();

        const texture = this.createDummyFireTexture();
        this.view.setupFire(texture);

        this.app.ticker.add(this.onUpdate, this);
    }

    public override onRemove(): void {
        this.app.ticker.remove(this.onUpdate, this);
        super.onRemove();
    }

    private createDummyFireTexture(): Texture {
        const g = new Graphics();
        g.circle(0, 0, 32).fill({ color: 0xffffff, alpha: 1 });
        const tex = this.app.renderer.generateTexture(g);
        g.destroy();
        return tex;
    }

    private readonly onUpdate = (): void => {
        if (this.view) {
            this.view.update(this.app.ticker.deltaTime);
        }
    }
}