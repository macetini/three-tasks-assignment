import type { Sprite } from 'pixi.js';
import { SignalType } from '../../../signal/type/SignalType';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../components/AceOfShadowsView';

export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {
    public override onRegister(): void {
        super.onRegister();
        
        this.signalBus.on<Sprite[]>(SignalType.CARDS_PREPARED, this.onCardsPrepared, this);
        this.signalBus.emit(SignalType.PREPARE_CARDS, this.app.renderer);
    }

    public override onRemove(): void {
        this.view.stopSequence();        
        this.signalBus.off(SignalType.CARDS_PREPARED, this.onCardsPrepared);

        super.onRemove();
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