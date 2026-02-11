// src/core/mvcs/command/FetchMagicWordsCommand.ts

import { GameConfig } from "../../../config/GameConfig";
import { SignalType } from "../../../signal/type/SignalType";
import type { MagicWordsResponse } from "../../model/states/dto/MagicWordsResponse";
import { MagicWordsModel } from "../../model/states/MagicWordsModel";
import { MagicWordVO } from "../../model/states/vo/MagicWordVO";
import { AbstractCommand } from "../AbstractCommand";

export class FetchMagicWordsCommand extends AbstractCommand {
    private readonly cfg = GameConfig.WORDS;

    public async execute(): Promise<void> {
        const response = await fetch(this.cfg.API_URL);
        const json = (await response.json()) as MagicWordsResponse;

        // 1. First, tell AssetService to load the new emoji textures
        // We want to wait for this so the View doesn't try to show empty sprites
        const assetPromises = json.emojies.map(emoji =>
            this.assetService.loadRemoteTexture(emoji.name, emoji.url)
        );
        await Promise.all(assetPromises);

        // 2. Hydrate the VO array
        const voArray = json.dialogue.map(item => new MagicWordVO(item.name, item.text));

        // 3. Update Model
        const model = this.modelMap.get<MagicWordsModel>(MagicWordsModel.NAME);
        model.setData(voArray);

        this.signalBus.emit(SignalType.MAGIC_WORDS_LOADED);
    }
}