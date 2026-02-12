import { Sprite } from 'pixi.js';
import { ModelSignal } from '../../../signal/type/ModelSignal';
import { CardModel } from '../../model/states/CardModel';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../components/AceOfShadowsView';

export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {
    public override onRegister(): void {
        super.onRegister();

        this.signalBus.on<Sprite[]>(ModelSignal.CARDS_PREPARED, this.onCardsPrepared, this);
        this.signalBus.emit(ModelSignal.PREPARE_CARDS, this.app.renderer);
    }

    public override onRemove(): void {
        this.view.stopStackingSequence();
        this.signalBus.off(ModelSignal.CARDS_PREPARED, this.onCardsPrepared);

        super.onRemove();
    }

    private onCardsPrepared(): void {
        const cards = this.modelMap.get<CardModel>(CardModel.NAME).cards;
        this.view.populateStack(cards);
        this.view.startStackingSequence();
    }

    protected override get viewComponent(): AceOfShadowsView {
        return this.view;
    }
}