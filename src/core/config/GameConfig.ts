// src/core/config/GameConfig.ts
export const GameConfig = {
    GLOBAL: {
        DEBUG: true,
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
        CONTENT_SCALER: 1000
    },
    WORDS: {
        SOFTGAMES_URL: 'https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords',
        DICEBEAR_URL: 'https://api.dicebear.com/9.x/fun-emoji/png?seed=default',
        DICEBEAR_BASE_URL: 'dicebear.com',
        DEFAULT_AVATAR_POSITION: "left",
        TOKEN_REGEX: /\{([^}]+)\}/g,
        AVATAR_SIZE: 56,
        PADDING: 24,
        MAX_WIDTH: 250,
        MIN_WIDTH: 375,
        LINE_HEIGHT: 28,
        EMOJI_SIZE: 22,
        BUBBLE_LEFT_COLOR: 0x2196F3,
        BUBBLE_RIGHT_COLOR: 0x424242,
        BUBBLE_STROKE_COLOR: 0x222222,
        BUBBLE_STROKE_WIDTH: 2,
        BUBBLE_PADDING: 15,
        BUBBLE_CORNER_RADIUS: 15,
        SCROLL_STEP: 40, // Pixels per key press
        SCROLL_SPEED: 0.5,
        MAX_SCROLL_HEIGHT: 75,
        MIN_SCROLL_HEIGHT: 600, // It would be better to use screen height, but this will work on most devices
        MIN_SCREEN_WIDTH: 375, // It would be better to use screen width, but this will work on most devices
        MAX_SCALE: 1.3,
        CHAT_CONTAINER_Y_OFFSET: 85,
        LINE_PADDING: 20
    },
    FLAME: {
        MAX_PARTICLES: 10,
        TEXTURE_SIZE: 64,
        TEXTURE_RESOLUTION: 2,
        FLAME_BASE_COLOR: 0xFFFFCC, // White hot base
        FLAME_CORE_COLOR: 0xFF8800, // Orange core
        FLAME_EMBERS_COLOR: 0xAA0000, // Cooling red embers            
        FLAME_BLEND_MODE: 'add'
    }
} as const;