// src/core/mvcs/signal/type/TaskType.ts
export const TaskType = {
    MAIN: 'MAIN',
    CARDS: 'CARDS',
    WORDS: 'WORDS',
    FLAME: 'FLAME',
} as const;

export type TaskType = typeof TaskType[keyof typeof TaskType];