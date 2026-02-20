import { vi } from 'vitest';

// Minimal PIXI v8 mock
vi.mock('pixi.js', () => {
    const MockContainer = class {        
        addChild = vi.fn();
        removeChild = vi.fn();
        destroy = vi.fn();
        
        position = { set: vi.fn(), x: 0, y: 0 };
        scale = { set: vi.fn(), x: 1, y: 1 };
        visible = true;
        alpha = 1;

        emit = vi.fn().mockReturnThis();
        on = vi.fn().mockReturnThis();
        once = vi.fn().mockReturnThis();
        off = vi.fn().mockReturnThis();
    };
    // Define the mock as a class
    class MockApplication {
        public init = vi.fn().mockResolvedValue(true);
        public stage = new MockContainer();
        public ticker = {
            add: vi.fn(),
            remove: vi.fn(),
            FPS: 60
        };
        public screen = { width: 1920, height: 1080 };
        public renderer = { width: 1920, height: 1080 };
    }

    return {
        // Change this line to return the Class directly
        Application: MockApplication,
        Container: MockContainer,

        Sprite: class extends MockContainer {
            public static readonly from = vi.fn(() => (
                { anchor: { set: vi.fn() } }));
        },

        Text: class extends MockContainer {
            style = {};
            text = '';
        },

        Assets: {
            init: vi.fn().mockResolvedValue(true),
            load: vi.fn().mockResolvedValue({}),
            add: vi.fn(),
        },
        // Add any others if the compiler complains
    };
});