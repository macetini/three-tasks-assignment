// src/core/mvcs/mediators/PhoenixFlameMediator.ts
import { ModelSignals } from "../../../signal/ModelSignals";
import { FlameModel } from "../../model/states/FlameModel";
import { AbstractMediator } from "../AbstractMediator";
import type { PhoenixFlameView } from "../components/PhoenixFlameView";

/**
 * Mediator for the Phoenix Flame task.
 * Handles the lifecycle of the fire effect, from texture preparation to frame updates.
 */
export class PhoenixFlameMediator extends AbstractMediator<PhoenixFlameView> {

    public override onRegister(): void {
        super.onRegister();

        this.signalBus.on(ModelSignals.FLAME_PREPARED, this.onFlamePrepared, this);
        this.app.ticker.add(this.onUpdate, this);
    }

    public override onViewAddedToRoot(): void {
        super.onViewAddedToRoot();
        this.signalBus.emit(ModelSignals.PREPARE_FLAME, this.app.renderer);
    }

    public override onRemove(): void {
        this.signalBus.off(ModelSignals.FLAME_PREPARED, this.onFlamePrepared);
        this.app.ticker.remove(this.onUpdate, this);
        super.onRemove();
    }

    /**
     * Called when the FlameModel has received its texture from the PrepareFlameCommand.
     */
    private readonly onFlamePrepared = (): void => {
        const flameTexture = this.modelMap.get<FlameModel>(FlameModel.NAME).flameTexture;
        this.view.setupFire(flameTexture);
    }

    /**
     * Frame-by-frame update for the particle physics.
     */
    private readonly onUpdate = (): void => {
        this.viewComponent.update(this.app.ticker.deltaTime);
    }

    protected override get viewComponent(): PhoenixFlameView {
        return this.view;
    }

}