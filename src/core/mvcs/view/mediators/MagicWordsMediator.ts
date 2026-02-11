// src/core/mvcs/view/mediator/MagicWordsMediator.ts
import { ModelType } from '../../../signal/type/ModelType';
import { AbstractMediator } from '../AbstractMediator';
import { MagicWordsView } from '../components/MagicWordsView';

export class MagicWordsMediator extends AbstractMediator<MagicWordsView> {

    public override onRegister(): void {
        super.onRegister();

        this.signalBus.on(ModelType.MAGIC_WORDS_LOADED, this.onWordsLoaded, this);
        this.signalBus.emit(ModelType.FETCH_MAGIC_WORDS);
    }

    private onWordsLoaded(): void {
        console.debug("[MagicWordsMediator] Words loaded.");
    }

    public override onRemove(): void {
        this.signalBus.off(ModelType.MAGIC_WORDS_LOADED, this.onWordsLoaded);
        super.onRemove();
    }
}