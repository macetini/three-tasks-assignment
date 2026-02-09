// src/core/mvcs/controller/StateController.ts
import { GameState } from "../../context/data/GameState";

export class StateController {
    private currentState: GameState = GameState.BOOTSTRAP;

    public async changeState(targetState: GameState): Promise<void> {
        if (this.currentState === targetState) {
            console.warn(`[StateController] Attempted to change to the same state: ${targetState}`);
            return;
        }

        await this.exitState(this.currentState);
        this.currentState = targetState;
        await this.enterState(this.currentState);
    }

    private async enterState(state: GameState): Promise<void> { }

    private async exitState(state: GameState): Promise<void> { }
}