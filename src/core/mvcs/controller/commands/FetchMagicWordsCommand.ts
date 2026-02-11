// src/core/mvcs/command/FetchMagicWordsCommand.ts

import { GameConfig } from "../../../config/GameConfig";
import { SignalType } from "../../../signal/type/SignalType";
import { MagicWordsModel } from "../../model/states/MagicWordsModel";
import type { MagicWordsResponse } from "../../model/vo/MagicWordVO";
import { AbstractCommand } from "../AbstractCommand";

export class FetchMagicWordsCommand extends AbstractCommand {
    private readonly cfg = GameConfig.WORDS;

    public async execute(): Promise<void> {
        console.debug("[FetchMagicWordsCommand] Executing.");
        try {
            const response = await fetch(this.cfg.API_URL);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }

            const json: MagicWordsResponse = await response.json();
            const model = this.modelMap.get<MagicWordsModel>(MagicWordsModel.NAME);
            model.setData(json.data);

            this.signalBus.emit(SignalType.WORDS_LOADED);

            console.debug("[FetchMagicWordsCommand] Words loaded successfully.");
        } catch (error) {
            console.error("[FetchMagicWordsCommand] Failed to fetch words:", error);
        }
    }
}