// src/core/signal/type/SignalType.ts
export const SignalType = {
    SWITCH_TASK: 'switch_task',
} as const;

// Optional: Extract the type for use in function signatures
export type SignalType = typeof SignalType[keyof typeof SignalType];