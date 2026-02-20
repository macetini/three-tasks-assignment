import { vi } from 'vitest';

vi.mock('pixi.js', () => {
    class MockContainer {
        public addChild = vi.fn();
        public removeChild = vi.fn();
        public destroy = vi.fn();
        public position = { set: vi.fn(), x: 0, y: 0 };
        public scale = { set: vi.fn(), x: 1, y: 1 };
        public anchor = { set: vi.fn(), x: 0, y: 0 };
        public visible = true;
        public alpha = 1;

        public emit = vi.fn().mockReturnThis();
        public on = vi.fn().mockReturnThis();
        public once = vi.fn().mockReturnThis();
        public off = vi.fn().mockReturnThis();
    }

    class MockSprite extends MockContainer {
        public static readonly from = vi.fn().mockImplementation(() => new MockSprite());
    }

    class MockText extends MockContainer {
        public text = '';
        public style = {};
    }

    return {
        Application: vi.fn().mockImplementation(() => ({
            init: vi.fn().mockResolvedValue(true),
            stage: new MockContainer(),
            ticker: { add: vi.fn(), remove: vi.fn(), FPS: 60 },
            screen: { width: 1920, height: 1080 },
            renderer: {
                width: 1920,
                height: 1080,
                on: vi.fn(),
                off: vi.fn()
            },
        })),
        Container: MockContainer,
        Sprite: MockSprite,
        Text: MockText,
        Assets: {
            init: vi.fn().mockResolvedValue(true),
            load: vi.fn().mockResolvedValue({}),
            add: vi.fn(),
        },
        UPDATE_PRIORITY: { HIGH: 50, LOW: -50, DEFAULT: 0 },
    };
});