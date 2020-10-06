module.exports = {
    roots: ["<rootDir>/test"],
    verbose: true,
    transform: {
      "^.+\\.tsx?$": "ts-jest"
    },
    coverageThreshold: {
      global: {
        branches: 60,
        functions: 70,
        lines: 80,
        statements: 80
      }
    },
    globals: {
      "ts-jest": {
        diagnostics: false
      }
    },
    setupFiles: [
      "./test/setupTests.ts"
    ],
    setupFilesAfterEnv: ["<rootDir>test/setupTests.ts"],
    snapshotSerializers: [
      "enzyme-to-json/serializer"
    ],
    moduleFileExtensions: ["ts", "tsx", "js"],
  };
  