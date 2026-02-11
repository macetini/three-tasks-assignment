// src/core/mvcs/view/mediator/MagicWordsMediator.ts
import { SignalType } from '../../../signal/type/SignalType';
import { TaskType } from '../../../signal/type/TaskType';
import { AbstractMediator } from '../AbstractMediator';
import { MagicWordsView } from '../components/MagicWordsView';

export class MagicWordsMediator extends AbstractMediator<MagicWordsView> {

    public override onRegister(): void {
        super.onRegister();

        // 1. Listen for the "Back" button
        this.view.on(MagicWordsView.BACK_CLICK_EVENT, this.onBackRequested, this);

        // 2. Listen for when the Command finishes updating the Model
        this.signalBus.on(SignalType.WORDS_LOADED, this.onWordsLoaded, this);

        // 3. Trigger the Command to fetch the data
        this.signalBus.emit(SignalType.FETCH_MAGIC_WORDS);
    }

    private onWordsLoaded(): void {
        // 4. Get data from Model and give to View
        //const model = this.modelMap.get<MagicWordsModel>(MagicWordsModel.NAME);
        //this.view.displayDialogue(model.words);
    }

    private onBackRequested(): void {
        this.signalBus.emit(SignalType.SWITCH_TASK, TaskType.MAIN);
    }

    public override onRemove(): void {
        this.signalBus.off(SignalType.WORDS_LOADED, this.onWordsLoaded);
        this.view.off(MagicWordsView.BACK_CLICK_EVENT, this.onBackRequested, this);
        super.onRemove();
    }
}