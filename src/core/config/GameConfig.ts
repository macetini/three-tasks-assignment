// src/core/config/GameConfig.ts
export const GameConfig = {
    GLOBAL: {
        BACK_BUTTON_X: 20,
        BACK_BUTTON_Y: 30,
        BACK_BUTTON_GRAPHIC: '◀'
    },
    MAIN: {
        BUTTON_WIDTH: 240,
        BUTTON_HEIGHT: 50,
        BUTTON_GAP: 15,
        BUTTON_COLOR: 0x222222
    },
    CARDS: {
        TEMPLATES_COUNT: 12,
        TOTAL_COUNT: 144,
        WIDTH: 200,
        HEIGHT: 280,
        RECT_RADIUS: 10,
        OUTLINE_THICKNESS: 4,
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
        SOFTGAMES_URL: 'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords',
        DICEBEAR_URL: 'https://api.dicebear.com/9.x/fun-emoji/png?seed=default',
        DICEBEAR_BASE_URL: 'dicebear.com',
        DEFAULT_AVATAR_POSITION: "left",
        TOKEN_REGEX: /\{([^}]+)\}/g,
    },
    FLAME: {
        // For Task 3
    }
} as const;