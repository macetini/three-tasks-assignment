import type { Renderer } from 'pixi.js';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../component/AceOfShadowsView';

export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {
    public override onRegister(): void {
        super.onRegister();
        this.buildCardStacks(this.app.renderer);
    }

    private async buildCardStacks(renderer: Renderer): Promise<void> {
        const cards = await this.assetService.getCards(renderer);
        this.view.populateStack(cards);
        this.view.startStackingSequence();
    }

    public override onRemove(): void {
        this.view.stopSequence();
        super.onRemove();
    }

    protected override get viewComponent(): AceOfShadowsView {
        return this.view;
    }
}