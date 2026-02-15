// src/core/mvcs/view/mediator/AceOfShadowsMediator.ts
import { ModelSignals } from '../../../signal/ModelSignals';
import { CardModel } from '../../model/states/CardModel';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../components/AceOfShadowsView';

/**
 * Mediator for the Ace of Shadows feature.
 * Coordinates between the CardModel (data) and AceOfShadowsView (rendering).
 * Handles the triggering of procedural card generation and the resulting animation flow.
 */
export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {

    /**
     * Registers the mediator to listen for the ModelSignals.CARDS_PREPARED signal.
     * When the signal is emitted, the onCardsPrepared function is called.
     */
    public override onRegister(): void {
        super.onRegister();
        this.signalBus.on(ModelSignals.CARDS_PREPARED, this.onCardsPrepared, this);
    }

    /**
     * Called when the view is added to the stage.
     * Prepares the cards for the Ace of Shadows feature by emitting
     * the ModelSignals.PREPARE_CARDS signal with the renderer as a payload.
     */
    protected override onViewAddedToRoot(): void {
        super.onViewAddedToRoot();
        console.debug(`[${this.constructor.name}] Preparing cards.`);
        this.signalBus.emit(ModelSignals.PREPARE_CARDS, this.app.renderer);
    }

    /**
     * Called when the view is removed from the stage.
     * Stops the stacking sequence of cards and removes the listener for the ModelSignals.CARDS_PREPARED signal.
     */
    public override onRemove(): void {
        this.viewComponent.stopStackingSequence();
        this.signalBus.off(ModelSignals.CARDS_PREPARED, this.onCardsPrepared);
        
        super.onRemove();
    }

    /**
     * Called when the cards have been prepared and the ModelSignals.CARDS_PREPARED signal is emitted.
     * Populates the stack with the prepared cards and starts the stacking sequence.
     */
    private onCardsPrepared(): void {
        const cards = this.modelMap.get<CardModel>(CardModel.NAME).cards;
        this.viewComponent.populateStack(cards);
        this.viewComponent.startStackingSequence();
    }

    protected override get viewComponent(): AceOfShadowsView {
        return this.view;
    }

}