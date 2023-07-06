module.exports = {
    env: {
        browser: true,
        es2021: true
    },
    extends: ['prettier', 'standard-with-typescript'],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname
    },
    rules: {
        indent: ['error', 4],
        quotes: ['error', 'single'],
        '@typescript-eslint/indent': ['error', 4],
        semi: ['error', 'always'],
        '@typescript-eslint/semi': ['error', 'always']
    }
};
