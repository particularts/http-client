import {FlatCompat} from '@eslint/eslintrc';
import js from '@eslint/js';
import typescriptEslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import chaiFriendly from 'eslint-plugin-chai-friendly';
import globals from 'globals';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
	baseDirectory: __dirname,
	recommendedConfig: js.configs.recommended,
	allConfig: js.configs.all,
});

export default [...compat.extends(
	'eslint:recommended',
	'plugin:@typescript-eslint/eslint-recommended',
	'plugin:@typescript-eslint/recommended',
), {
	plugins: {
		'@typescript-eslint': typescriptEslint,
		'chai-friendly': chaiFriendly,
	},

	languageOptions: {
		globals: {
			...globals.node,
		},

		parser: tsParser,
		ecmaVersion: 'latest',
		sourceType: 'module',

		parserOptions: {
			project: ['./tsconfig.json'],
		},
	},

	rules: {
		indent: ['error', 'tab'],
		'linebreak-style': ['error', 'unix'],
		quotes: ['error', 'single'],
		semi: ['error', 'always'],

		'@typescript-eslint/no-unused-expressions': 'off',
		'chai-friendly/no-unused-expressions': 'error',
	},
}];
