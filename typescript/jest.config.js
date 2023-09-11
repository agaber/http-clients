/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
};

/**
 * https://jestjs.io/docs/getting-started
 * https://jestjs.io/docs/getting-started#using-typescript
 * https://kulshekhar.github.io/ts-jest/docs/getting-started/installation/#jest-config-file
 * https://jestjs.io/docs/configuration
 *
 * npm install --save-dev jest
 * npm install --save-dev ts-jest
 * npm install --save-dev @types/jest
 * npx ts-jest config:init
 *
 * for axios:
 * npm install axios axios-mock-adapter --save-dev
 */
