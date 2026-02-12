/**
 * A centralized Service Locator for application state.
 * * The ModelMap manages the lifecycle of domain models, ensuring that 
 * state is persisted and accessible across different Commands and Mediators.
 */
export class ModelMap {
    /** Internal storage for model instances. */
    private readonly models = new Map<string, any>();

    /**
     * Registers a model instance with a unique key.
     * 
     * @param key - The unique identifier (usually Model.NAME).
     * @param modelInstance - The singleton instance of the model.
     */
    public map(key: string, modelInstance: any): void {
        if (this.models.has(key)) {
            console.warn(`[ModelMap] Model with key "${key}" is already mapped and will be overwritten.`);
        }
        this.models.set(key, modelInstance);
    }

    /**
     * Retrieves a specific model instance and casts it to the requested type.
     * 
     * @template T - The Class type of the Model.
     * @param key - The identifier used during mapping.
     * @returns The model instance cast to T.
     * @throws Error if the model is not found in the registry.
     */
    public get<T>(key: string): T {
        const model = this.models.get(key);

        if (!model) {
            throw new Error(`[ModelMap] Model with key "${key}" not found. Ensure it is mapped in the GameContext.`);
        }

        return model as T;
    }

    /**
     * Returns a snapshot of the current registry as a plain object.
     * Useful for debugging or state serialization.
     */
    public getRegistry(): Record<string, any> {
        return Object.fromEntries(this.models);
    }
}