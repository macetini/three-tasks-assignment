import type { Renderer } from 'pixi.js';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../component/AceOfShadowsView';
import { SignalType } from '../../../signal/type/SignalType';
import { TaskType } from '../../../signal/type/TaskType';

export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {
    public override onRegister(): void {
        super.onRegister();

        this.viewComponent.on(AceOfShadowsView.CARD_BACK_CLICK_EVENT, this.onCardBackClickEvent);
        this.buildCardStacks(this.app.renderer);
    }

    private readonly onCardBackClickEvent = (): void => {
        console.log('[AceOfShadowsMediator] Handling: ', AceOfShadowsView.CARD_BACK_CLICK_EVENT);
        this.signalBus.emit(SignalType.SWITCH_TASK, TaskType.MAIN);
    }

    private async buildCardStacks(renderer: Renderer): Promise<void> {
        const cardSprites = await this.assetService.getCards(renderer);
        this.view.populateStack(cardSprites);
        this.view.startStackingSequence();
    }

    public override onRemove(): void {
        this.view.stopSequence();
        this.viewComponent.off(AceOfShadowsView.CARD_BACK_CLICK_EVENT, this.onCardBackClickEvent);

        super.onRemove();
    }

    protected override get viewComponent(): AceOfShadowsView {
        return this.view;
    }
}