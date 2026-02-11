// src/core/signal/type/SignalType.ts
export const SignalType = {
    SWITCH_TASK: 'switch_task',
    PREPARE_CARDS: 'prepare_cards',
    CARDS_PREPARED: 'cards_prepared',
} as const;

// Optional: Extract the type for use in function signatures
export type SignalType = typeof SignalType[keyof typeof SignalType];