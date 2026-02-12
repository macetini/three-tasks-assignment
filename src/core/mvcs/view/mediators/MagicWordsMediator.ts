// src/core/mvcs/view/mediator/MagicWordsMediator.ts
import { ModelSignal } from '../../../signal/type/ModelSignal';
import { MagicWordsModel } from '../../model/states/MagicWordsModel';
import { AbstractMediator } from '../AbstractMediator';
import { MagicWordsView } from '../components/MagicWordsView';

export class MagicWordsMediator extends AbstractMediator<MagicWordsView> {

    public override onRegister(): void {
        super.onRegister();

        this.signalBus.on(ModelSignal.MAGIC_WORDS_LOADED, this.onWordsLoaded, this);
        this.signalBus.emit(ModelSignal.FETCH_MAGIC_WORDS);
    }

    private onWordsLoaded(): void {
        const model = this.modelMap.get<MagicWordsModel>(MagicWordsModel.NAME);
        const words = model.words;

        const textureProvider = (id: string) => model.getTexture(id);
        const positionProvider = (name: string) => model.getPosition(name);

        this.viewComponent.buildRows(words, { textureProvider, positionProvider });

        this.triggerLayout();

        console.debug(`[MagicWordsMediator] Rendered ${words.length} chat rows.`);
    }

    public override onRemove(): void {
        this.signalBus.off(ModelSignal.MAGIC_WORDS_LOADED, this.onWordsLoaded);
        super.onRemove();
    }

    protected override get viewComponent(): MagicWordsView {
        return this.view;
    }

}