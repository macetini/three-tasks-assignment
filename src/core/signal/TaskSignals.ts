// src/core/mvcs/signal/type/TaskType.ts
export const TaskSignals = {
    MAIN: 'MAIN',
    CARDS: 'CARDS',
    WORDS: 'WORDS',
    FLAME: 'FLAME',
} as const;

export type TaskSignals = typeof TaskSignals[keyof typeof TaskSignals];