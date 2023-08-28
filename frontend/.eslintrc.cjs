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
        sourceType: 'module',
    },
    parser: 'vue-eslint-parser',
    extends: [
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['vue', '@typescript-eslint', 'prettier'],
    rules: {
        'vue/no-v-model-argument': 'off',
        'vue/no-multiple-template-root': 'off',
        'vue/script-indent': ['error', 4],
        'prettier/prettier': 'error',
        'vue/html-indent': ['error', 4],
        'no-undef': 'off',
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
