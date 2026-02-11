import type { Sprite } from 'pixi.js';
import { SignalType } from '../../../signal/type/SignalType';
import { TaskType } from '../../../signal/type/TaskType';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../components/AceOfShadowsView';

export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {
    public override onRegister(): void {
        super.onRegister();

        this.viewComponent.on(AceOfShadowsView.CARD_BACK_CLICK_EVENT, this.onCardBackClickEvent);

        this.signalBus.on<Sprite[]>(SignalType.CARDS_PREPARED, this.onCardsPrepared, this);
        this.signalBus.emit(SignalType.PREPARE_CARDS, this.app.renderer);
    }

    public override onRemove(): void {
        this.view.stopSequence();
        this.viewComponent.off(AceOfShadowsView.CARD_BACK_CLICK_EVENT, this.onCardBackClickEvent);
        this.signalBus.off(SignalType.CARDS_PREPARED, this.onCardsPrepared);

        super.onRemove();
    }

    private readonly onCardBackClickEvent = (): void => {
        console.log('[AceOfShadowsMediator] Handling: ', AceOfShadowsView.CARD_BACK_CLICK_EVENT);
        this.signalBus.emit(SignalType.SWITCH_TASK, TaskType.MAIN);
    }

    // Named method
    private onCardsPrepared(cards: Sprite[]): void {
        this.view.populateStack(cards);
        this.view.startStackingSequence();
    }

    protected override get viewComponent(): AceOfShadowsView {
        return this.view;
    }
}