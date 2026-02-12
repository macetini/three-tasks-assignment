// src/core/mvcs/command/PrepareCardsCommand.ts
import type { Renderer } from "pixi.js";
import { ModelSignals } from "../../../signal/ModelSignals";
import { CardModel } from "../../model/states/CardModel";
import { AbstractCommand } from "../AbstractCommand";

/**
 * Command responsible for the procedural generation of the 144-card stack.
 * This command utilizes the AssetService to bake card textures at runtime,
 * populates the CardModel with the resulting sprites, and notifies the
 * application that the stack is ready for animation.
 */
export class PrepareCardsCommand extends AbstractCommand {

    /**
     * Executes the command to prepare the cards.
     * Retrieves the cards from the asset service and sets them on the card model.
     * Emits the ModelSignals.CARDS_PREPARED signal once the cards are prepared.
     * 
     * @throws {Error} If the command fails to prepare the cards.
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