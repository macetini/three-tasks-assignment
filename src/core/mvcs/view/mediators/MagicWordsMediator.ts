// src/core/mvcs/view/mediator/MagicWordsMediator.ts
import { SignalType } from '../../../signal/type/SignalType';
import { TaskType } from '../../../signal/type/TaskType';
import { AbstractMediator } from '../AbstractMediator';
import { MagicWordsView } from '../components/MagicWordsView';

export class MagicWordsMediator extends AbstractMediator<MagicWordsView> {

    public override onRegister(): void {
        super.onRegister();

        this.view.on(MagicWordsView.BACK_CLICK_EVENT, this.onBackRequested, this);

        this.fetchDialogueData();
    }

    private async fetchDialogueData(): Promise<void> {
        try {
            // We will move the actual fetch logic to AssetService shortly 
            const response = await fetch('https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords');
            const data = await response.json();

            this.view.displayDialogue(data.data);
        } catch (error) {
            console.error("[MagicWordsMediator] Failed to fetch dialogue:", error);
        }
    }

    private onBackRequested(): void {
        this.signalBus.emit(SignalType.SWITCH_TASK, TaskType.MAIN);
    }

    public override onRemove(): void {
        this.view.off(MagicWordsView.BACK_CLICK_EVENT, this.onBackRequested, this);
        super.onRemove();
    }
}