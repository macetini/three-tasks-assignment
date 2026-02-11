// src/core/signal/type/ModelType.ts
export const ModelType = {
    SWITCH_TASK: 'switch_task',
    PREPARE_CARDS: 'prepare_cards',
    CARDS_PREPARED: 'cards_prepared',
    FETCH_MAGIC_WORDS: 'fetch_magic_words',
    MAGIC_WORDS_LOADED: 'magic_words_loaded',
} as const;

export type ModelType = typeof ModelType[keyof typeof ModelType];