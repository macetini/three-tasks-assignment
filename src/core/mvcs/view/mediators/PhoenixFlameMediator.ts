// src/core/mvcs/mediators/PhoenixFlameMediator.ts
import { AbstractMediator } from "../AbstractMediator";
import type { PhoenixFlameView } from "../components/PhoenixFlameView";

export class PhoenixFlameMediator extends AbstractMediator<PhoenixFlameView> {

    public override onRegister(): void {
        super.onRegister();

        // 1. Get texture from your modelMap (e.g., your AssetModel)
        //const assets = this.modelMap.get(ModelType.ASSETS); // Adjust based on your Map logic
        /*
        const texture = assets.getTexture('fire_particle');

        // 2. Setup the view
        this.view.setupFire(texture);
        */

        this.app.ticker.add(this.onUpdate, this);
    }

    public override onRemove(): void {
        super.onRemove();
        this.app.ticker.remove(this.onUpdate, this);       
    }

    private onUpdate(): void {
        //this.view.update(this.app.ticker.deltaTime);
    }
}