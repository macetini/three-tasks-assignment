import { vi } from 'vitest';

vi.mock('pixi.js', async (importOriginal) => {
    class MockContainer {
        public children: any[] = [];
        public addChild = vi.fn((child) => {
            if (child && !this.children.includes(child)) this.children.push(child);
            return child;
        });
        public removeChildren = vi.fn(() => { this.children = []; });
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
        public tint = 0;
        public texture = { destroy: vi.fn() };
        public static readonly from = vi.fn().mockImplementation(() => new MockSprite());
    }

    class MockGraphics {
        // Defining as methods ensures they exist on the prototype for vi.spyOn
        public circle() { return this; }
        public moveTo() { return this; }
        public lineTo() { return this; }
        public bezierCurveTo() { return this; }
        public roundRect() { return this; }
        public rect() { return this; }
        public stroke() { return this; }
        public fill() { return this; }
        public closePath() { return this; }
        public destroy() {
            // Method intentionally empty for mock purposes
        }

        public alpha = 1;
        public visible = true;
    }

    // Grab the real PIXI members that don't need mocking (Color, Texture, etc.)
    const actual = await importOriginal() as any;
    // Hybrid object    
    return {
        ...actual, // Spread real PIXI (provides Color, Matrix, etc.)
        Application: vi.fn().mockImplementation(() => ({
            init: vi.fn().mockResolvedValue(true),
            stage: new MockContainer(),
            ticker: { add: vi.fn(), remove: vi.fn(), FPS: 60 },
            screen: { width: 1920, height: 1080 },
            renderer: {
                width: 1920,
                height: 1080,
                on: vi.fn(),
                off: vi.fn(),
                generateTexture: vi.fn().mockReturnValue({ destroy: vi.fn() })
            },
        })),
        Container: MockContainer,
        Sprite: MockSprite,
        Graphics: MockGraphics,

        Text: class extends MockContainer {
            public text = '';
            public style = {};
        },
        Assets: {
            init: vi.fn().mockResolvedValue(true),
            load: vi.fn().mockResolvedValue({}),
            add: vi.fn(),
        },
    };
});