module.exports = {
    roots: ['<rootDir>/src'],
    collectCoverage: true,
    collectCoverageFrom: ['<rootDir>/src/**/*.ts'],
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    preset: '@shelf/jest-mongodb',
    transform: {
        '.+\\.ts$': 'ts-jest',
    },
};
