// src/core/config/GameConfig.ts
export const GameConfig = {
    GLOBAL: {
        BACK_BUTTON_X: 10,
        BACK_BUTTON_Y: 35,
    },
    MAIN: {
        BUTTON_WIDTH: 240,
        BUTTON_HEIGHT: 50,
        BUTTON_GAP: 15,
    },
    CARDS: {
        TEMPLATES_COUNT: 12,
        TOTAL_COUNT: 144,
        WIDTH: 200,
        HEIGHT: 280,
        VORONOI_POINT_COUNT: 10,
        GAP: 500,
        ROTATION_VARIANCE: 0.5,
        Y_CONTENT_OFFSET: 100,
        Y_CARD_OFFSET: 2,
        DURATION_SEC: 2,
        DELAY_SEC: 1,
        CONTENT_SCALER: 1000,
    },
    WORDS: {
        API_URL: 'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords',
        // We'll add more here tomorrow!
    },
    FLAME: {
        // For Task 3
    }
} as const;