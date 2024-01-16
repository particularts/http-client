import {fileURLToPath} from 'node:url';
import rollupCommonjs from '@rollup/plugin-commonjs';
import {esbuildPlugin} from '@web/dev-server-esbuild';
import {fromRollup} from '@web/dev-server-rollup';
import {playwrightLauncher} from '@web/test-runner-playwright';

const commonjs = fromRollup(rollupCommonjs);

export default {
	files: ['src/**/*.spec.ts'],
	nodeResolve: true,
	coverage: true,
	coverageConfig: {
		include: ['src/**/*'],
	},
	browsers: [
		playwrightLauncher({product: 'chromium'}),
		playwrightLauncher({product: 'firefox'}),
		playwrightLauncher({product: 'webkit'}),
	],
	plugins: [
		commonjs({
			include: ['**/node_modules/**/*'],
		}),
		esbuildPlugin({
			ts: true,
			tsconfig: fileURLToPath(new URL('./tsconfig.json', import.meta.url)),
		}),
	],
};
