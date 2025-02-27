module.exports = {
    preset: "jest-preset-angular",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["<rootDir>/setup-jest.ts"],
    transformIgnorePatterns: ["node_modules/(?!.*\\.mjs$)"],
    moduleNameMapper: {
      "^@app/(.*)$": "<rootDir>/src/app/app/$1",
      "^@assets/(.*)$": "<rootDir>/src/app/assets/$1",
      "^@env/(.*)$": "<rootDir>/src/app/environments/$1",
    },
  };