/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line import/extensions
const config = require('./jest.config');

config.testMatch = ['**/*.test.ts'];

module.exports = config;
