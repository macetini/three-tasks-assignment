import type { Renderer } from 'pixi.js';
import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../component/AceOfShadowsView';

export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {
    public override onRegister(): void {
        super.onRegister();
        this.initCardTemplates(this.app.renderer);
    }

    private async initCardTemplates(renderer: Renderer): Promise<void> {
        await this.assetService.initCardTemplates(renderer);

        const textures = this.assetService.cardTextures;
        const outline = this.assetService.getOutlineTexture();
        this.view.populateDeck(textures, outline);

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