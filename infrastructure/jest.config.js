module.exports = {
  roots: ['<rootDir>/test'],
  runner: "groups",
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
