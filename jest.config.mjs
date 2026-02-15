/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "jsdom",
  setupFiles: ["jest-canvas-mock", "./jest.setup.mjs"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    // Redirect problematic libraries to our dummy file
    "^gsap$": "<rootDir>/tests/__mocks__/dummy.js",
    "^pixi.js$": "<rootDir>/tests/__mocks__/dummy.js",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: {
          verbatimModuleSyntax: false,
          esModuleInterop: true,
        },
      },
    ],
  },
};
