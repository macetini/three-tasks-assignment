// src/core/mvcs/command/PrepareCardsCommand.ts
import type { Renderer } from "pixi.js";
import { ModelSignals } from "../../../signal/type/ModelSignals";
import { CardModel } from "../../model/states/CardModel";
import { AbstractCommand } from "../AbstractCommand";

export class PrepareCardsCommand extends AbstractCommand {
    /**
     * @override
     */
    public async execute(): Promise<void> {
        console.debug("[PrepareCardsCommand] Executing.");
        try {
            const renderer = this.payload as Renderer;
            const cardSprites = await this.assetService.getCards(renderer);
            const cardModel = this.modelMap.get<CardModel>(CardModel.NAME);
            cardModel.setCards(cardSprites);

            console.debug("[PrepareCardsCommand] Cards prepared and Model updated.");
            this.signalBus.emit(ModelSignals.CARDS_PREPARED);
        } catch (error) {
            console.error("[PrepareCardsCommand] Failed to prepare cards:", error);
            throw error;
        }
    }
}