/* eslint-disable @typescript-eslint/no-var-requires */
// eslint-disable-next-line import/extensions
const config = require('./jest.config');

config.testMatch = ['**/*.spec.ts'];

module.exports = config;
