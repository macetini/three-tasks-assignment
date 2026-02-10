import type { Renderer } from 'pixi.js';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../component/AceOfShadowsView';

export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {
    public override onRegister(): void {
        super.onRegister();
        this.initCardTemplates(this.app.renderer);
    }

    private async initCardTemplates(renderer: Renderer): Promise<void> {
        const cards = await this.assetService.getCards(renderer);
        this.view.populateDeck(cards);

        const interval = setInterval(() => {
            if (this.view.getStackACount() > 0) {
                this.view.moveTopCardToStackB();
            } else {
                clearInterval(interval);
            }
        }, 1000); // One card every second
    }

    public override onRemove(): void {
        super.onRemove();
    }

    protected override get viewComponent(): AceOfShadowsView {
        return this.view;
    }
}