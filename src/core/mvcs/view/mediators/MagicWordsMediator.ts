// src/core/mvcs/view/mediator/MagicWordsMediator.ts
import { SignalType } from '../../../signal/type/SignalType';
import { AbstractMediator } from '../AbstractMediator';
import { MagicWordsView } from '../components/MagicWordsView';

export class MagicWordsMediator extends AbstractMediator<MagicWordsView> {

    public override onRegister(): void {
        super.onRegister();

        this.signalBus.on(SignalType.MAGIC_WORDS_LOADED, this.onWordsLoaded, this);
        this.signalBus.emit(SignalType.FETCH_MAGIC_WORDS);
    }

    private onWordsLoaded(): void {
        console.debug("[MagicWordsMediator] Words loaded.");
    }

    public override onRemove(): void {
        this.signalBus.off(SignalType.MAGIC_WORDS_LOADED, this.onWordsLoaded);
        super.onRemove();
    }
}