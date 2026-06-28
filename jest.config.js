module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transformIgnorePatterns: ['node_modules/(?!(.*\\.mjs$|@ionic|@stencil|ionicons))'],
  moduleNameMapper: {
    '^ionicons/components/(.*)$': '<rootDir>/node_modules/ionicons/components/$1',
  },
};
