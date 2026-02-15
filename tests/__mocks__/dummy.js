// tests/__mocks__/dummy.js
import { jest } from "@jest/globals";

const eventMethods = {
  on: jest.fn().mockReturnThis(),
  off: jest.fn().mockReturnThis(),
  once: jest.fn().mockReturnThis(),
  emit: jest.fn().mockReturnThis(),
};

// Helper to create a position object that actually stores values
const createPoint = (target) => ({
  x: 0,
  y: 0,
  set(x, y) {
    this.x = x;
    this.y = y;
    // Also update the target if it has x/y properties
    if (target) {
      target.x = x;
      target.y = y;
    }
  },
});

export class Container {
  constructor() {
    Object.assign(this, eventMethods);
    this.children = [];
    this.visible = true;
    this.alpha = 1;
    this.x = 0;
    this.y = 0;
    // Pass 'this' so that position.set(10, 20) updates this.x and this.y
    this.position = createPoint(this);
    this.scale = createPoint();
    this.parent = null;
  }

  addChild(...args) {
    args.forEach((child) => {
      if (child) {
        // 1. If child already has a parent, remove it from that parent's children array
        if (child.parent && child.parent.children) {
          const index = child.parent.children.indexOf(child);
          if (index > -1) {
            child.parent.children.splice(index, 1);
          }
        }
        // 2. Set new parent and add to this container
        child.parent = this;
        this.children.push(child);
      }
    });
    return args[0];
  }

  addChildAt(child, index) {
    if (child) {
      if (child.parent && child.parent.children) {
        const oldIndex = child.parent.children.indexOf(child);
        if (oldIndex > -1) child.parent.children.splice(oldIndex, 1);
      }
      child.parent = this;
      this.children.splice(index, 0, child);
    }
    return child;
  }
  removeChild(child) {
    if (!child) return;
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null; // Clean up the reference
    }
  }

  removeChildren() {
    this.children.forEach((child) => {
      child.parent = null;
    });
    this.children = [];
  }

  // Add destroy to fix the dispose error
  destroy() {
    return jest.fn();
  }

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
    this.anchor = createPoint();
    this.rotation = 0;
  }
}

export class Text extends Container {
  constructor(optionsOrText) {
    // Add this param
    super();
    this.text =
      typeof optionsOrText === "string"
        ? optionsOrText
        : optionsOrText?.text || "";
    this.style = optionsOrText?.style || {};
    this.anchor = createPoint();
  }
}

export class Graphics extends Container {
  // Pixi v8 modern API
  fill() {
    return this;
  }
  stroke() {
    return this;
  }
  roundRect() {
    return this;
  }
  rect() {
    return this;
  }
  circle() {
    return this;
  }

  // Legacy/Common methods
  beginFill() {
    return this;
  }
  drawRect() {
    return this;
  }
  drawCircle() {
    return this;
  }
  drawRoundedRect() {
    return this;
  }
  lineStyle() {
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

export class Rectangle {
  constructor(x = 0, y = 0, width = 0, height = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // Adding this satisfies SonarLint S2094
  contains(x, y) {
    return (
      x >= this.x &&
      x <= this.x + this.width &&
      y >= this.y &&
      y <= this.y + this.height
    );
  }
}

export class Texture {
  // Class field declarations (Satisfies S7757)
  valid = true;
  width = 100;
  height = 100;

  static from() {
    return new Texture();
  }
  static EMPTY = new Texture();
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

export default {
  Container,
  Sprite,
  Point,
  Text,
  Graphics,
  Rectangle,
  Texture,
  gsap,
};
