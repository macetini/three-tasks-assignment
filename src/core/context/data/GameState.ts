export const GameState = {
    BOOTSTRAP: 'bootstrap',
    ASSETS_LOADING: 'assets_loading',
    MAIN_MENU: 'main_menu',
} as const;

export type GameState = (typeof GameState)[keyof typeof GameState];