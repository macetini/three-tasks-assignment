// src/core/mvcs/command/PrepareFlameCommand.ts
import type { Renderer } from "pixi.js";
import { ModelSignal } from "../../../signal/type/ModelSignal";
import { AbstractCommand } from "../AbstractCommand";
import { FlameModel } from "../../model/states/FlameModel";

export class PrepareFlameCommand extends AbstractCommand {
    /**
     * @override
     */
    public async execute(): Promise<void> {
        console.debug("[PrepareFlameCommand] Executing.");
        try {
            const renderer = this.payload as Renderer;

            const flameTexture = await this.assetService.getFlameTexture(renderer);

            const flameModel = this.modelMap.get<FlameModel>(FlameModel.NAME);
            flameModel.setFlameTexture(flameTexture);

            console.debug("[PrepareFlameCommand] Flame texture prepared and Model updated.");

            this.signalBus.emit(ModelSignal.FLAME_PREPARED);
        } catch (error) {
            console.error("[PrepareFlameCommand] Failed to prepare flame:", error);
            throw error;
        }
    }
}