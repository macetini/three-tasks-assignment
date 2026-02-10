import { AbstractMediator } from '../AbstractMediator';
import { AceOfShadowsView } from '../component/AceOfShadowsView';

export class AceOfShadowsMediator extends AbstractMediator<AceOfShadowsView> {
    //private _intervalId: number | null = null;

    public override onRegister(): void {
        super.onRegister();

        // 3. Start the process: 144 cards, move 1 every 1 second
        //this._intervalId = window.setInterval(() => this.dealCard(), 1000);
    }

    /*
    private dealCard(): void {
        const cards = this.viewComponent.cardStack;
        if (cards.length === 0) {
            if (this._intervalId) clearInterval(this._intervalId);
            return;
        }

        // Get the top card from Stack A (the last one in the array)
        const card = cards.pop()!;

        // Calculate global position so it doesn't "jump" when we switch containers
        const globalPos = card.getGlobalPosition();

        // Move to Stack B's container (this makes it the top-most visual element)
        this.viewComponent.stackB.addChild(card);

        // Convert back to Stack B's local space to keep it exactly where it was visually
        const localPos = this.viewComponent.stackB.toLocal(globalPos);
        card.position.set(localPos.x, localPos.y);

        // FLY! 2 seconds duration as per requirements
        gsap.to(card, {
            x: 0,
            y: (this.viewComponent.stackB.children.length - 1) * -0.5, // Maintain the stack offset
            duration: 2,
            ease: "sine.inOut"
        });
    }

    private readonly onResize = (): void => {
        this.applyLayout();
    };

    private applyLayout(): void {
        const { width, height } = this.app.screen;
        this.viewComponent.layout(width, height);
    }

    public override onRemove(): void {
        // Clean up everything to prevent memory leaks!
        if (this._intervalId) clearInterval(this._intervalId);
        this.app.renderer.off('resize', this.onResize);

        // Kill all active card animations
        gsap.killTweensOf(this.viewComponent.stackB.children);

        super.onRemove();
    }
        */
}