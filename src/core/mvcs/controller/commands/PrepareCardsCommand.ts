import type { Renderer, Sprite } from "pixi.js";
import { SignalType } from "../../../signal/type/SignalType";
import { CardModel } from "../../model/states/CardModel";
import { AbstractCommand } from "../AbstractCommand";

export class PrepareCardsCommand extends AbstractCommand {
    /**
     * @override
     */
    public async execute(): Promise<void> {
        console.log("[PrepareCardsCommand] Executing.");
        try {
            const renderer = this.payload as Renderer;

            const cardSprites = await this.assetService.getCards(renderer);

            const cardModel = this.modelMap.get<CardModel>(CardModel.NAME);
            cardModel.setCards(cardSprites);

            this.signalBus.emit<Sprite[]>(SignalType.CARDS_PREPARED, cardSprites);
            console.log("[PrepareCardsCommand] Cards prepared and Model updated.");
        } catch (error) {
            console.error("[PrepareCardsCommand] Failed to prepare cards:", error);
        }
    }
}