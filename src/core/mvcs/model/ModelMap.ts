// src/core/mvcs/model/ModelMap.ts
export class ModelMap {
    private readonly _models = new Map<string, any>();

    /**
     * Maps a key to a specific Model instance.
     */
    public map(key: string, modelInstance: any): void {
        this._models.set(key, modelInstance);
    }

    /**
     * Retrieves an object containing all mapped models.
     */
    public getRegistry(): Record<string, any> {
        return Object.fromEntries(this._models);
    }

    public get<T>(key: string): T {
        return this._models.get(key) as T;
    }
}