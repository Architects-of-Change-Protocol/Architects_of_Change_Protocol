module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/contracts/**/*.test.ts'],
  moduleNameMapper: {
    '^@aoc/protocol/contracts$': '<rootDir>/packages/protocol/src/contracts',
    '^@aoc/capability-tokens$': '<rootDir>/packages/capability-tokens/src',
    '^@aoc/consent-engine$': '<rootDir>/packages/consent-engine/src',
    '^@aoc/scoped-access$': '<rootDir>/packages/scoped-access/src',
    '^@aoc/audit-sdk$': '<rootDir>/packages/audit-sdk/src'
  }
};
