// eslint-disable-next-line
const tsconfig = require('./tsconfig.json');
// eslint-disable-next-line
const { pathsToModuleNameMapper } = require('ts-jest');

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest/presets/default-esm',
    extensionsToTreatAsEsm: ['.ts'],
    transform: {
        '^.+\\.ts?$': [
            'ts-jest',
            {
                useESM: true
            }
        ]
    },
    resolver: 'ts-jest-resolver',
    roots: ['<rootDir>'],
    modulePaths: [tsconfig.compilerOptions.baseUrl],
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, { prefix: '<rootDir>/src/' })
};
