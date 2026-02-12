// src/core/signal/ModelSignals.ts
/**
 * Global Signal identifiers for Application and Domain-level communication.
 * * These constants drive the Command execution and Mediator reactivity
 * throughout the MVCS lifecycle.
 */
export const ModelSignals = {
    /** Triggers the RootView to switch between different task components. */
    SWITCH_TASK: 'switch_task',

    /** Logic: Request procedural generation of the 144-card stack. */
    PREPARE_CARDS: 'prepare_cards',
    /** Logic: Notifies the AceOfShadowsMediator that textures are ready on the GPU. */
    CARDS_PREPARED: 'cards_prepared',

    /** Logic: Triggers the FetchMagicWordsCommand to load remote JSON and assets. */
    FETCH_MAGIC_WORDS: 'fetch_magic_words',
    /** Logic: Notifies the MagicWordsMediator that dialogue data and textures are hydrated. */
    MAGIC_WORDS_LOADED: 'magic_words_loaded',

    /** Logic: Request procedural generation of the flame particle texture. */
    PREPARE_FLAME: 'prepare_flame',
    /** Logic: Notifies the PhoenixFlameMediator that the particle texture is baked. */
    FLAME_PREPARED: 'flame_prepared'
} as const;

/**
 * Union type derived from ModelSignals values.
 * Ensures that SignalBus emits/listeners only use valid keys.
 */
export type ModelSignals = typeof ModelSignals[keyof typeof ModelSignals];