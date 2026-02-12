// src/core/mvcs/signal/type/TaskType.ts
export const TaskSignal = {
    MAIN: 'MAIN',
    CARDS: 'CARDS',
    WORDS: 'WORDS',
    FLAME: 'FLAME',
} as const;

export type TaskSignal = typeof TaskSignal[keyof typeof TaskSignal];