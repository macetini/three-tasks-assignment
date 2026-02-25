// src/core/mvcs/command/FetchMagicWordsCommand.ts
import { Cache, type Texture } from "pixi.js";
import { GameConfig } from "../../../config/GameConfig";
import { ModelSignals } from "../../../signal/ModelSignals";
import type { MagicWordsResponse } from "../../model/states/dto/MagicWordsResponse";
import { MagicWordsModel } from "../../model/states/MagicWordsModel";
import { MagicWordVO } from "../../model/states/vo/MagicWordVO";
import { AbstractCommand } from "../AbstractCommand";

/**
 * Command responsible for the complete setup of the Magic Words feature.
 * * This orchestrates a complex initialization sequence:
 * 1. Loads fail-safe fallback assets.
 * 2. Fetches dynamic dialogue data from the Softgames API.
 * 3. Concurrently loads all associated remote textures (emojis and avatars).
 * 4. Hydrates the MagicWordsModel with structured Value Objects (VOs).
 * 
 * * @extends AbstractCommand<void>
 */
export class FetchMagicWordsCommand extends AbstractCommand {
    private readonly cfg = GameConfig.WORDS;

    /**
     * Executes the MagicWords feature setup.
     * This command is a critical path for the MagicWords feature and should not be skipped.
     * It will load the necessary assets (emoji and avatars) via the AssetService, and then
     * fetch the MagicWords API data and populate the MagicWordsModel with the data.
     * Once the setup is complete, it will notify the application that the feature is ready for use.
     * 
     * @returns A promise that resolves when the setup is complete.
     */
    public async execute(): Promise<void> {
        try {
            await this.loadFailSafeAssets();
            await this.loadFeatureContent();

            this.signalBus.emit(ModelSignals.MAGIC_WORDS_LOADED);

            console.debug("[FetchMagicWordsCommand] Magic Words Task Ready.");
        } catch (error) {
            console.error("[FetchMagicWordsCommand] Setup failed:", error);
        }
    }

    /**
     * Loads the fail-safe assets required for the MagicWords feature.
     * This currently only includes the Dicebear emoji asset.
     * 
     * @returns A promise that resolves when all assets are loaded.
     */
    private async loadFailSafeAssets(): Promise<void> {
        await this.assetService.loadRemoteTexture("default", this.cfg.DICEBEAR_URL);
    }

    /**
     * Fetches the MagicWords API and populates the MagicWordsModel with the data.
     * It also loads the necessary assets (emoji and avatars) via the AssetService.
     * This command is a critical path for the MagicWords feature and should not be skipped.
     * 
     * @returns A promise that resolves when all assets are loaded.
     */
    private async loadFeatureContent(): Promise<void> {
        const response = await fetch(this.cfg.SOFTGAMES_URL);
        const json = (await response.json()) as MagicWordsResponse;

        // Map requirements to "Safe Promises"
        const emojiRequests = json.emojies.map(e => this.safeLoad(e.name, e.url));
        const avatarRequests = json.avatars.map(a => this.safeLoad(a.name, a.url));

        // Wait for all to finish (either Success or Timed Out/Failed)
        await Promise.all([...emojiRequests, ...avatarRequests]);

        this.hydrateModel(json);
    }

    /**
     * Loads a remote asset via URL and stores it in the Pixi Cache under an alias.
     * If the request times out (after cfg.ASSET_TIMEOUT_MS milliseconds) or fails for any other reason,
     * it will skip the asset and log a warning message.
     * 
     * @param key - The alias used to retrieve the texture later.
     * @param url - The remote address of the asset.
     * 
     * @returns A promise that resolves when the asset is loaded or skipped.
     */
    private async safeLoad(key: string, url: string): Promise<void> {
        const loadPromise = this.assetService.loadRemoteTexture(key, url);

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Timeout: ${key}`)), this.cfg.ASSET_TIMEOUT_MS)
        );

        try {
            await Promise.race([loadPromise, timeoutPromise]);
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.warn(`[FetchMagicWordsCommand] Asset [${key}] skipped: ${errorMessage}`);
            // Do not rethrow error, continue with the next asset.
        }
    }

    /**
     * Hydrates the MagicWordsModel with structured Value Objects (VOs) created from the API response.
     * This method is responsible for mapping the JSON response to the domain model.
     * It creates an array of MagicWordVOs from the dialogue data and sets it on the MagicWordsModel.
     * It also maps all asset keys (default, emojis, avatars) to their cached Textures and sets it on the MagicWordsModel.
     * If an asset key is not found in the Cache, it is skipped.
     * 
     * @param json The JSON response containing the Magic Words data.
     * 
     */
    private hydrateModel(json: MagicWordsResponse): void {
        const model = this.modelMap.get<MagicWordsModel>(MagicWordsModel.NAME);

        // Value Object creation
        const voArray = json.dialogue.map(item => new MagicWordVO(item.name, item.text));
        model.setData(voArray);
        model.setAvatarData(json.avatars);

        const textureMap = this.getTextureMap(json);
        model.setTextures(textureMap);
    }


    /**
     * Maps the required asset keys (default, emojis, avatars) to their cached Textures.
     * If an asset key is not found in the Cache, it is skipped and the 'default' texture is used as a fallback.
     * This method is responsible for mapping the JSON response to the domain model.
     * It is called by the hydrateModel method.
     * 
     * @param json The JSON response containing the Magic Words data.
     * @returns A Map of asset keys to their cached Textures.
     */
    private getTextureMap(json: MagicWordsResponse): Map<string, Texture> {
        // Map what we actually got in the Cache
        const textureMap = new Map<string, Texture>();
        const keys = ["default",
            ...json.emojies.map(e => e.name),
            ...json.avatars.map(a => a.name)];

        keys.forEach(key => {
            if (Cache.has(key)) {
                textureMap.set(key, Cache.get(key));
            } else {
                // Architectural fallback: use the 'default' if a specific avatar failed
                textureMap.set(key, Cache.get("default"));
            }
        });

        return textureMap;
    }
}