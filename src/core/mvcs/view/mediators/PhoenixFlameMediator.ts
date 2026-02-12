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

    /**
     * Called after the view is registered.
     * Sets up the event listeners and performs the necessary setup.
     * Listens for the ModelSignals.FLAME_PREPARED signal and calls onFlamePrepared when it is emitted.
     * Adds the mediator to the application's ticker to receive frame updates.
     */
    public override onRegister(): void {
        super.onRegister();

        this.signalBus.on(ModelSignals.FLAME_PREPARED, this.onFlamePrepared, this);
        this.app.ticker.add(this.onUpdate, this);
    }

    /**
     * Called when the view is added to the stage.
     * Triggers the preparation of the Phoenix Flame texture by emitting
     * the ModelSignals.PREPARE_FLAME signal with the renderer as a payload.
     */
    public override onViewAddedToRoot(): void {
        super.onViewAddedToRoot();
        this.signalBus.emit(ModelSignals.PREPARE_FLAME, this.app.renderer);
    }

    /**
     * Called when the view is removed from the stage.
     * Removes the event listeners for the ModelSignals.FLAME_PREPARED signal and the ticker.
     * Calls the parent onRemove method to complete the cleanup process.
     */
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


    /**
     * Returns the view component. Can be cast to the specific PhoenixFlameView type.
     * 
     * @returns {PhoenixFlameView} The view component.
     */
    protected override get viewComponent(): PhoenixFlameView {
        return this.view;
    }

}