// src/core/mvcs/view/mediator/MainMenuMediator.ts
import { AbstractMediator } from '../AbstractMediator';
import { MainMenuView } from '../component/MainMenuView';

export class MainMenuMediator extends AbstractMediator<MainMenuView> {

    public override onRegister(): void {
        // RobotLegs style: Map signals/events to local handlers
        this.view.btnTask1.on('pointerdown', () => this.onTaskRequest('CARDS'));
        this.view.btnTask2.on('pointerdown', () => this.onTaskRequest('FIRE'));
        this.view.btnTask3.on('pointerdown', () => this.onTaskRequest('SLOT'));
    }

    private onTaskRequest(task: string): void {
        console.log(`[MainMenuMediator] Requesting task: ${task}`);

        /**
         * SENIOR TIP: In a full framework, we'd dispatch a Signal here.
         * For now, we'll use a custom DOM event or a callback passed 
         * through the mediatorMap if you want to keep it simple.
         */
        const event = new CustomEvent('SWITCH_TASK', { detail: task });
        window.dispatchEvent(event);
    }

    public override onRemove(): void {
        this.view.btnTask1.removeAllListeners();
        this.view.btnTask2.removeAllListeners();
        this.view.btnTask3.removeAllListeners();
        super.onRemove();
    }
}