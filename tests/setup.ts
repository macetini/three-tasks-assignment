import { vi } from 'vitest';

vi.mock('gsap', () => ({
    gsap: {
        to: vi.fn(),
        from: vi.fn(),
        killTweensOf: vi.fn(),
        set: vi.fn(),
        timeline: vi.fn(() => ({
            to: vi.fn().mockReturnThis(),
            call: vi.fn().mockReturnThis(),
            kill: vi.fn(),
            repeat: vi.fn().mockReturnThis(),
        })),
    },
    default: {
        to: vi.fn(),
        killTweensOf: vi.fn(),
    }
}));

vi.mock('pixi.js', async (importOriginal) => {
    class MockContainer {
        public children: any[] = [];
        public x: number = 0;
        public y: number = 0;
        public width: number = 0;
        public height: number = 0;
        public parent: any = null;

        public addChild = vi.fn((...children: any[]) => {
            children.forEach(child => {
                if (child) {
                    // If the child already has a parent, remove it from that parent first
                    if (child.parent && child.parent !== this) {
                        const oldParent = child.parent;
                        const index = oldParent.children.indexOf(child);
                        if (index > -1) {
                            oldParent.children.splice(index, 1);
                        }
                    }

                    if (!this.children.includes(child)) {
                        this.children.push(child);
                        child.parent = this;
                    }
                }
            });
            return children[0];
        });

        public addChildAt = vi.fn((child, index) => {
            if (child && !this.children.includes(child)) {
                this.children.splice(index, 0, child);
            }
            return child;
        });

        public removeChildren = vi.fn(() => {
            const removed = [...this.children];
            this.children.forEach(child => { child.parent = null; });
            this.children = [];
            return removed;
        });

        public removeChild = vi.fn();

        public destroy = vi.fn();
        public position = { set: vi.fn(), x: 0, y: 0 };
        public scale = { set: vi.fn(), x: 1, y: 1 };
        public anchor = { set: vi.fn(), x: 0, y: 0 };
        public visible = true;
        public alpha = 1;

        private _events: Record<string, Function[]> = {};

        public on = vi.fn((event: string, callback: Function, context?: any) => {
            if (!this._events[event]) this._events[event] = [];
            // Store the callback, bound to context if provided
            this._events[event].push(context ? callback.bind(context) : callback);
            return this;
        });

        public once = vi.fn((event: string, callback: Function, context?: any) => {
            const wrapper = (...args: any[]) => {
                this.off(event, wrapper); // Remove itself when called
                callback.apply(context, args);
            };
            return this.on(event, wrapper);
        });

        public emit = vi.fn((event: string, ...args: any[]) => {
            const listeners = this._events[event];
            if (listeners) {
                listeners.forEach(fn => fn(...args));
                return true;
            }
            return false;
        });

        public off = vi.fn((event: string, callback: Function) => {
            if (this._events[event]) {
                this._events[event] = this._events[event].filter(cb => cb !== callback);
            }
            return this;
        });

        public toGlobal(point: { x: number, y: number }) {
            return { x: point.x + this.x, y: point.y + this.y };
        }

        public toLocal(point: { x: number, y: number }) {
            return { x: point.x - this.x, y: point.y - this.y };
        }
    }

    class MockGraphics extends MockContainer { // Inherit from Container to get children/width
        public clear = vi.fn().mockReturnThis(); // Add the missing clear!
        public circle() { return this; }
        public moveTo() { return this; }
        public lineTo() { return this; }
        public bezierCurveTo() { return this; }
        public roundRect() { return this; }
        public rect() { return this; }
        public stroke() { return this; }
        public fill() { return this; }
        public closePath() { return this; }
    }

    class MockSprite extends MockContainer {
        public tint = 0;
        public texture = { destroy: vi.fn() };
        public static readonly from = vi.fn().mockImplementation(() => new MockSprite());
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