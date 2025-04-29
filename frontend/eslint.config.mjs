import vue from 'eslint-plugin-vue';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import parser from 'vue-eslint-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    ...compat.extends(
        'eslint:recommended',
        'plugin:vue/vue3-recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended'
    ),
    {
        plugins: {
            vue,
            '@typescript-eslint': typescriptEslint,
            prettier,
        },

        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.commonjs,
                io: 'readonly',
                logger: 'readonly',
                error: 'readonly',
                enums: 'readonly',
                eventBus: 'readonly',
                softError: 'readonly',
                hardError: 'readonly',
            },

            parser: parser,
            ecmaVersion: 2022,
            sourceType: 'module',

            parserOptions: {
                parser: '@typescript-eslint/parser',
            },
        },

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
    },
];
