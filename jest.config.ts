import { defaults } from 'jest-config'

/** @type {import('ts-jest').InitialOptionsTsJest} */
// eslint-disable-next-line import/no-default-export
export default {
  testMatch: ['<rootDir>/**/*.spec.(ts|tsx)'],
  testEnvironment: 'jsdom',
  preset: 'ts-jest',
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'js'],
  reporters: [
    'default',
    [
      'jest-junit',
      { outputDirectory: '_test/jest/test-results', outputName: 'jest.xml' },
    ],
  ],
}
