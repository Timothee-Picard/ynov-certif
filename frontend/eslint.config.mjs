// eslint.config.mjs
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'
import prettier from 'eslint-config-prettier'
import testingLibrary from 'eslint-plugin-testing-library'
import jestDom from 'eslint-plugin-jest-dom'
import globals from 'globals'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({ baseDirectory: __dirname })

export default [
    { ignores: ['.next/**', 'node_modules/**', 'coverage/**', 'dist/**'] },

    // Règles Next.js + TypeScript
    ...compat.extends('next/core-web-vitals', 'next/typescript'),

    // Règles spécifiques aux fichiers de test
    {
        files: ['**/*.{test,spec}.{js,jsx,ts,tsx}'],
        languageOptions: { globals: { ...globals.jest } },
        plugins: {
            'testing-library': testingLibrary,
            'jest-dom': jestDom,
        },
        rules: {
            // recommended react preset de testing-library
            ...testingLibrary.configs.react.rules,
            // recommended jest-dom
            ...jestDom.configs.recommended.rules,
        },
    },

    // Doit être en dernier pour neutraliser les conflits de formatage
    prettier,
]
