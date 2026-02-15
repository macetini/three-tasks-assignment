import { jest } from "@jest/globals";

const mockEventMethods = {
  on: jest.fn().mockReturnThis(),
  off: jest.fn().mockReturnThis(),
  once: jest.fn().mockReturnThis(),
  emit: jest.fn().mockReturnThis(),
  removeAllListeners: jest.fn().mockReturnThis(),
};

jest.mock(
  "pixi.js",
  () => ({
    Container: class {
      constructor() {
        Object.assign(this, mockEventMethods);
        this.children = [];
        this.visible = true;
        this.alpha = 1;
        this.position = { set: jest.fn(), x: 0, y: 0 };
        this.scale = { set: jest.fn(), x: 1, y: 1 };
        this.x = 0;
        this.y = 0;
      }
      addChild(...args) {
        args.forEach((c) => {
          if (c) this.children.push(c);
        });
        return args[0];
      }
      removeChild = jest.fn();
      toGlobal = jest.fn(() => ({ x: 0, y: 0 }));
      toLocal = jest.fn(() => ({ x: 0, y: 0 }));
    },
    Sprite: class {
      constructor() {
        Object.assign(this, mockEventMethods);
        this.anchor = { set: jest.fn() };
        this.position = { set: jest.fn(), x: 0, y: 0 };
        this.scale = { set: jest.fn(), x: 1, y: 1 };
        this.x = 0;
        this.y = 0;
        this.rotation = 0;
        this.alpha = 1;
        this.visible = true;
      }
    },
    Text: class {
      constructor() {
        Object.assign(this, mockEventMethods);
        this.style = {};
        this.anchor = { set: jest.fn() };
        this.position = { set: jest.fn(), x: 0, y: 0 };
      }
    },
    Graphics: class {
      constructor() {
        Object.assign(this, mockEventMethods);
        this.position = { set: jest.fn() };
      }
      beginFill() {
        return this;
      }
      drawRect() {
        return this;
      }
      endFill() {
        return this;
      }
      clear() {
        return this;
      }
    },
    Point: class {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }
      set(x, y) {
        this.x = x;
        this.y = y;
      }
    },
  }),
  { virtual: true },
);
// GSAP MOCKS

jest.mock(
  "gsap",
  () => ({
    gsap: {
      to: jest.fn(),
      killTweensOf: jest.fn(),
      timeline: jest.fn(() => ({
        call: jest.fn().mockReturnThis(),
        to: jest.fn().mockReturnThis(),
        kill: jest.fn().mockReturnThis(),
      })),
    },
  }),
  { virtual: true },
);

jest.mock(
  "pixi.js",
  () => ({
    Container: class {
      constructor() {
        this.children = [];
        this.position = { set: () => {} };
        this.scale = { set: () => {}, x: 1, y: 1 };
        this.addChild = (...args) =>
          args.forEach((c) => c && this.children.push(c));
        this.toGlobal = () => ({ x: 0, y: 0 });
        this.toLocal = () => ({ x: 0, y: 0 });
      }
    },
    Sprite: class {
      constructor() {
        this.anchor = { set: () => {} };
        this.position = { set: () => {} };
        this.scale = { set: () => {}, x: 1, y: 1 };
      }
    },
    Point: class {
      constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
      }
      set(x, y) {
        this.x = x;
        this.y = y;
      }
    },
  }),
  { virtual: true },
);
