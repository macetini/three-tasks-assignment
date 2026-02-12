// src/core/signal/type/ModelType.ts
export const ModelSignals = {
    SWITCH_TASK: 'switch_task',
    PREPARE_CARDS: 'prepare_cards',
    CARDS_PREPARED: 'cards_prepared',
    FETCH_MAGIC_WORDS: 'fetch_magic_words',
    MAGIC_WORDS_LOADED: 'magic_words_loaded',
    PREPARE_FLAME: 'prepare_flame',
    FLAME_PREPARED: 'flame_prepared'
} as const;

export type ModelSignals = typeof ModelSignals[keyof typeof ModelSignals];