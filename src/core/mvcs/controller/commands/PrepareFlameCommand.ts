// src/core/mvcs/command/PrepareFlameCommand.ts
import type { Renderer } from "pixi.js";
import { ModelSignals } from "../../../signal/ModelSignals";
import { AbstractCommand } from "../AbstractCommand";
import { FlameModel } from "../../model/states/FlameModel";

/**
 * Command responsible for generating and distributing the Phoenix Flame texture.
 * * This command handles the asynchronous procedural generation of the flame 
 * sprite via the AssetService, updates the FlameModel with the result, 
 * and notifies the application that the asset is ready for use.
 */
export class PrepareFlameCommand extends AbstractCommand {

    /**
     * Executes the procedural texture generation flow.
     * @override
     * @returns A promise that resolves when the texture is baked and stored.
     */
    public async execute(): Promise<void> {
        console.debug("[PrepareFlameCommand] Executing.");
        try {
            const renderer = this.payload as Renderer;

            const flameTexture = await this.assetService.getFlameTexture(renderer);

            const flameModel = this.modelMap.get<FlameModel>(FlameModel.NAME);
            flameModel.setFlameTexture(flameTexture);

            console.debug("[PrepareFlameCommand] Flame texture prepared and Model updated.");

            this.signalBus.emit(ModelSignals.FLAME_PREPARED);
        } catch (error) {
            console.error("[PrepareFlameCommand] Failed to prepare flame:", error);
            throw error;
        }
    }
}