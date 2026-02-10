// src/core/mvcs/signal/type/TaskType.ts
export const TaskType = {
    CARDS: 'CARDS',
    FIRE: 'FIRE',
    SLOT: 'SLOT'
} as const;

// This line allows you to use 'TaskType' as a type for your variables
export type TaskType = typeof TaskType[keyof typeof TaskType];