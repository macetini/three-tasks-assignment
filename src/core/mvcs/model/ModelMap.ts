// src/core/mvcs/model/ModelMap.ts
export class ModelMap {
    private readonly models = new Map<string, any>();

    /**
     * Maps a key to a specific Model instance.
     */
    public map(key: string, modelInstance: any): void {
        this.models.set(key, modelInstance);
    }

    /**
     * Retrieves an object containing all mapped models.
     */
    public getRegistry(): Record<string, any> {
        return Object.fromEntries(this.models);
    }

    /**
     * Retrieves a specific model instance by key.
     */
    public get<T>(key: string): T {
        return this.models.get(key) as T;
    }
    
}