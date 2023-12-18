module.exports = {
    extends: ['prettier', 'standard-with-typescript'],
    parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: 'tsconfig.json',
        tsconfigRootDir: __dirname
    },
    ignorePatterns: ['**/*.js'],
    rules: {
        indent: ['error', 4],
        quotes: ['error', 'single'],
        '@typescript-eslint/indent': ['error', 4],
        semi: ['error', 'always'],
        '@typescript-eslint/semi': ['error', 'always'],
        '@typescript-eslint/no-extraneous-class': 'off',
        'import/no-named-default': 'off'
    }
};
