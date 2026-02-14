// src/core/mvcs/view/component/MainMenuView.ts
import { gsap } from 'gsap';
import { Container, Graphics, Text } from 'pixi.js';
import { GameConfig } from '../../../config/GameConfig';
import { TaskSignals } from '../../../signal/TaskSignals';
import { AbstractView } from '../AbstractView';

/**
 * The primary navigation menu for the application.
 * Displays buttons to navigate between the three technical tasks.
 */
export class MainMenuView extends AbstractView {
    /**
     * The custom event emitted when a menu button is clicked.
     */
    public static readonly MENU_CLICK_EVENT = 'menuClickEvent';

    private readonly cfg = GameConfig.MAIN;

    /**
     * The collection of menu buttons.
     */
    private readonly buttons: Container[] = [];
    private entranceTimeline: gsap.core.Timeline | null = null;

    public override onAddedToRoot(): void {
        this.addButton("ACE OF SHADOWS", TaskSignals.CARDS, this.cfg.BUTTON_HEIGHT);
        this.addButton("MAGIC WORDS", TaskSignals.WORDS, this.cfg.BUTTON_HEIGHT * 2);
        this.addButton("PHOENIX FLAME", TaskSignals.FLAME, this.cfg.BUTTON_HEIGHT * 3);

        super.onAddedToRoot();
    }

    /**
    * 
    * The Main Menu does not require navigation elements of its own.
    * 
    * @override
    */
    protected override createBackButton(): void {
        // Intentional no-op: Root level has no "Back" destination.
    }

    /**
     * Creates an interactive button with hover effects and labels.
     * 
     * @param label - The text displayed on the button.
     * @param taskType - The string identifier for navigation.
     */
    private addButton(label: string, taskType: string, y: number = 0): void {
        const button = new Container();
        button.cursor = 'pointer';
        button.eventMode = 'static';

        // Initial state for animation
        button.alpha = 0;
        button.position.set(Math.random() * 1000, y);

        const buttonText = new Text({
            text: label,
            style: { fill: 'white', fontSize: 16, fontWeight: 'bold' }
        });
        buttonText.anchor.set(0.5);
        buttonText.position.set(
            this.cfg.BUTTON_WIDTH * 0.5,
            this.cfg.BUTTON_HEIGHT * 0.5);

        const bg = new Graphics()
            .roundRect(0, 0,
                this.cfg.BUTTON_WIDTH,
                this.cfg.BUTTON_HEIGHT, 8)
            .fill({
                color: this.cfg.BUTTON_COLOR,
                alpha: 0.8
            });

        button.addChild(bg, buttonText);

        button.on('pointertap', () => {
            this.emit(MainMenuView.MENU_CLICK_EVENT, taskType);
        });

        this.addChild(button);
        this.buttons.push(button);
    }

    /**
     * Orchestrates a sequential entrance for the UI elements.
     */
    private playStaggeredEntrance(toX: number, toY: number = 0): void {
        if (this.buttons.length === 0) return;
        
        this.entranceTimeline?.kill();
        this.entranceTimeline = gsap.timeline();

        this.entranceTimeline.to(this.buttons, {
            alpha: 1,
            x: toX - this.cfg.BUTTON_WIDTH * 0.5,
            y: (index: number) => toY + index * (this.cfg.BUTTON_HEIGHT + this.cfg.BUTTON_GAP),
            duration: 0.5,
            stagger: 0.1,
            ease: "back.out(1.7)",
        });
    }

    /**
    * Aligns buttons vertically and centers the entire menu within 
    * the provided dimensions.
    * 
    * @param width The current width of the Pixi screen
    * @param height The current height of the Pixi screen
    */
    public override layout(width: number, height: number): void {
        super.layout(width, height);
        this.playStaggeredEntrance(width * 0.5, height * 0.25);

        // Too much logging (enable if needed)
        //console.debug(`[MainMenuView] Using responsive layout. View positioned at (${this.x}, ${this.y})`);
    }
}