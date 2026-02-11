// src/core/mvcs/command/FetchMagicWordsCommand.ts
import type { Texture } from "pixi.js";
import { GameConfig } from "../../../config/GameConfig";
import { ModelType } from "../../../signal/type/ModelType";
import type { MagicWordsResponse } from "../../model/states/dto/MagicWordsResponse";
import { MagicWordsModel } from "../../model/states/MagicWordsModel";
import { MagicWordVO } from "../../model/states/vo/MagicWordVO";
import { AbstractCommand } from "../AbstractCommand";

// src/core/mvcs/command/FetchMagicWordsCommand.ts

export class FetchMagicWordsCommand extends AbstractCommand {
    private readonly cfg = GameConfig.WORDS;

    public async execute(): Promise<void> {
        try {
            const response = await fetch(this.cfg.SOFTGAMES_URL);
            const json = (await response.json()) as MagicWordsResponse;

            //Prepare ALL remote assets (Emojis + Avatars)
            const assetPromises: Promise<Texture | null>[] = [];

            assetPromises.push(this.assetService.loadRemoteTexture("default", this.cfg.DICEBEAR_URL));

            // Load Emojis
            json.emojies.forEach(emoji => {
                assetPromises.push(this.assetService.loadRemoteTexture(emoji.name, emoji.url));
            });
            // Load Avatars
            json.avatars.forEach(avatar => {
                assetPromises.push(this.assetService.loadRemoteTexture(avatar.name, avatar.url));
            });

            await Promise.all(assetPromises);

            const model = this.modelMap.get<MagicWordsModel>(MagicWordsModel.NAME);

            const voArray = json.dialogue.map(item => new MagicWordVO(item.name, item.text));
            model.setData(voArray);

            model.setAvatarData(json.avatars);

            console.debug("[FetchMagicWordsCommand] Magic words fetched and Model updated.");
            this.signalBus.emit(ModelType.MAGIC_WORDS_LOADED);
        } catch (error) {
            console.error("[FetchMagicWordsCommand] Failed to fetch magic words:", error);
            throw error;
        }
    }
}