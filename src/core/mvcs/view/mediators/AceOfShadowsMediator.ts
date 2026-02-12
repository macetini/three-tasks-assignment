import { ModelSignals } from '../../../signal/type/ModelSignals';
import { CardModel } from '../../model/states/CardModel';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../components/AceOfShadowsView';

export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {
    public override onRegister(): void {
        super.onRegister();

        this.signalBus.on(ModelSignals.CARDS_PREPARED, this.onCardsPrepared, this);
    }

    protected override onViewReady(): void {
        super.onViewReady();
        console.debug(`[${this.constructor.name}] Preparing cards.`);
        this.signalBus.emit(ModelSignals.PREPARE_CARDS, this.app.renderer);
    }

    public override onRemove(): void {
        this.view.stopStackingSequence();
        this.signalBus.off(ModelSignals.CARDS_PREPARED, this.onCardsPrepared);
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