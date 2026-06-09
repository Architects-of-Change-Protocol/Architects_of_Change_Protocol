module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }]
  },
  testMatch: ['<rootDir>/tests/contracts/**/*.test.ts', '<rootDir>/__tests__/contracts/**/*.test.ts', '<rootDir>/__tests__/architecture/**/*.test.ts', '<rootDir>/__tests__/constitution/**/*.test.ts'],
  moduleNameMapper: {
    '^@aoc/protocol/contracts$': '<rootDir>/packages/protocol/src/contracts',
    '^@aoc/protocol/claims$': '<rootDir>/packages/protocol/src/claims',
    '^@aoc/protocol/adapters$': '<rootDir>/packages/protocol/src/adapters',
    '^@aoc/protocol/runtime-registry$': '<rootDir>/packages/protocol/src/runtime-registry',
    '^@aoc/enterprise/assurance/(.*)$': '<rootDir>/enterprise/src/assurance/$1',
    '^@aoc/enterprise/assurance$': '<rootDir>/enterprise/src/assurance',
    '^@aoc/enterprise$': '<rootDir>/enterprise/src',
    '^@aoc/capability-tokens$': '<rootDir>/packages/capability-tokens/src',
    '^@aoc/consent-engine$': '<rootDir>/packages/consent-engine/src',
    '^@aoc/scoped-access$': '<rootDir>/packages/scoped-access/src',
    '^@aoc/audit-sdk$': '<rootDir>/packages/audit-sdk/src',
    '^@aoc-runtime/audit-runtime$': '<rootDir>/packages/audit-runtime/src/index.ts',
    '^@aoc-runtime/trust-registry-runtime$': '<rootDir>/packages/trust-registry-runtime/src/index.ts',
    '^@aoc-runtime/governance-runtime$': '<rootDir>/packages/governance-runtime/src/index.ts',
    '^@aoc-runtime/provider-interfaces$': '<rootDir>/packages/provider-interfaces/src/index.ts',
    '^@aoc-runtime/shared-types$': '<rootDir>/packages/shared-types/src/index.ts',
    '^@aoc-runtime/crypto$': '<rootDir>/crypto/index.ts'
  }
};
