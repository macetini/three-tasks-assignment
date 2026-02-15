// tests/__mocks__/dummy.js
import { jest } from "@jest/globals";

const eventMethods = {
  on: jest.fn().mockReturnThis(),
  off: jest.fn().mockReturnThis(),
  once: jest.fn().mockReturnThis(),
  emit: jest.fn().mockReturnThis(),
};

export class Container {
  constructor() {
    Object.assign(this, eventMethods);
    this.children = [];
    this.position = { set: jest.fn() };
    this.scale = { set: jest.fn(), x: 1, y: 1 };
    this.visible = true;
    this.x = 0;
    this.y = 0;
    this.parent = null; // Track the parent
  }

  addChild(...args) {
    args.forEach((c) => {
      if (c) {
        // Real Pixi behavior: Remove from old parent before adding to new one
        if (c.parent) {
          const index = c.parent.children.indexOf(c);
          if (index > -1) c.parent.children.splice(index, 1);
        }
        c.parent = this;
        this.children.push(c);
      }
    });
    return args[0];
  }

  removeChild() {}

  toGlobal() {
    return { x: 0, y: 0 };
  }

  toLocal() {
    return { x: 0, y: 0 };
  }
}

export class Sprite extends Container {
  constructor() {
    super();
    this.anchor = { set: jest.fn() };
    this.rotation = 0;
    this.alpha = 1;
  }
}

export class Text extends Container {
  constructor() {
    super();
    this.style = {};
    this.anchor = { set: jest.fn() };
  }
}

export class Graphics extends Container {
  constructor() {
    super();
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
}

export class Point {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
  set(x, y) {
    this.x = x;
    this.y = y;
  }
}

export const gsap = {
  to: jest.fn(),
  killTweensOf: jest.fn(),
  timeline: jest.fn(() => ({
    call: jest.fn().mockReturnThis(),
    to: jest.fn().mockReturnThis(),
    kill: jest.fn().mockReturnThis(),
  })),
};

export default { Container, Sprite, Point, Text, Graphics, gsap };
