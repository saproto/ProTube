const tsConfig = require('./tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

// eslint-disable-next-line
const cleanup = tsConfigPaths.register({
    baseUrl: tsConfig.compilerOptions.outDir,
    paths: tsConfig.compilerOptions.paths
});

// When path registration is no longer needed
// cleanup();