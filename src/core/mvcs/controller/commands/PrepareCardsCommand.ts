import type { Renderer, Sprite } from "pixi.js";
import { AbstractCommand } from "../AbstractCommand";
import { CardModel } from "../../model/states/CardModel";
import { SignalType } from "../../../signal/type/SignalType";

export class PrepareCardsCommand extends AbstractCommand {
    /**
     * @override
     */
    public async execute(): Promise<void> {
        console.log("[PrepareCardsCommand] Executing.");

        // The payload passed from the Mediator is the PIXI Renderer
        const renderer = this.payload as Renderer;

        try {
            // 2. Use the injected AssetService to get card sprites
            const cardSprites = await this.assetService.getCards(renderer);

            // 3. Retrieve the CardModel from the dynamic modelMap
            const cardModel = this.modelMap.get<CardModel>(CardModel.NAME);

            // 4. Update the model with the new data
            cardModel.setCards(cardSprites);

            // 5. Notify the system that cards are ready to be displayed
            this.signalBus.emit<Sprite[]>(SignalType.CARDS_PREPARED, cardSprites);

            console.log("[PrepareCardsCommand] Cards prepared and Model updated.");
        } catch (error) {
            console.error("[PrepareCardsCommand] Failed to prepare cards:", error);
        }
    }
}