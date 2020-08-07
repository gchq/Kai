module.exports = {
    roots: ["<rootDir>/test"],
    verbose: true,
    transform: {
      "^.+\\.tsx?$": "ts-jest"
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
  