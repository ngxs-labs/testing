var path = require('path');

module.exports = {
    verbose: true,
    watch: false,
    cache: false,
    preset: 'jest-preset-angular',
    setupFilesAfterEnv: ['<rootDir>/setupJest.ts'],
    rootDir: path.resolve('.'),
    testMatch: ['<rootDir>/src/**/*.spec.ts'],
    collectCoverageFrom: ['<rootDir>/src/lib/**/*.ts', '<rootDir>/src/jest/**/*.ts' ],
    coverageReporters: ['json', 'lcovonly', 'lcov', 'text', 'html'],
    coveragePathIgnorePatterns: ['/node_modules/'],
    globals: {
        'ts-jest': {
            tsConfig: '<rootDir>/tsconfig.json',
            allowSyntheticDefaultImports: true
        }
    },
    moduleNameMapper: {
        "@ngxs-labs/testing/jest": "<rootDir>/src/jest/src/public_api.ts",
        "@ngxs-labs/testing": "<rootDir>/src/public_api.ts"
    },
    bail: true,
    collectCoverage: true,
    modulePathIgnorePatterns: ['<rootDir>/dist/'],
    modulePaths: ['<rootDir>']
};
