// src/core/mvcs/signal/TaskSignals.ts

/**
 * Unique identifiers for the application's primary task modules.
 * These constants are used by the RootViewMediator to resolve which 
 * View Class to instantiate during a task switch.
 */
export const TaskSignals = {
    /** The entry-point navigation menu. */
    MAIN: 'MAIN',
    /** Task 1: Ace of Shadows (144 Card Stack). */
    CARDS: 'CARDS',
    /** Task 2: Magic Words (Rich Text & Emojis). */
    WORDS: 'WORDS',
    /** Task 3: Phoenix Flame (Particle Emitter). */
    FLAME: 'FLAME',
} as const;

/**
 * Union type derived from TaskSignals values.
 * Ensures that any navigation logic is restricted to these four valid states.
 */
export type TaskSignals = typeof TaskSignals[keyof typeof TaskSignals];