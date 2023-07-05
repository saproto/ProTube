module.exports = {
    env: {
        browser: true,
        node: true,
        commonjs: true,
        es2021: true,
    },
    overrides: [],
    parserOptions: {
        ecmaVersion: 2022,
        parser: '@typescript-eslint/parser',
    },
    parser: 'vue-eslint-parser',
    extends: [
        'plugin:vue/base',
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:vue/essential',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['vue', '@typescript-eslint', 'prettier'],
    rules: {
        'vue/script-indent': ['error', 4],
        'prettier/prettier': 'error',
        'vue/html-indent': ['error', 4],
        'vue/max-attributes-per-line': [
            'error',
            {
                singleline: {
                    max: 4,
                },
                multiline: {
                    max: 3,
                },
            },
        ],
    },
    globals: {
        io: 'readonly',
        logger: 'readonly',
        error: 'readonly',
        enums: 'readonly',
        eventBus: 'readonly',
        softError: 'readonly',
        hardError: 'readonly',
    },
};
