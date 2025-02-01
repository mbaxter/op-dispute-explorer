import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: [vitePreprocess(), mdsvex()],

	kit: {
		// adapter-auto only supports some environments, see https://svelte.dev/docs/kit/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://svelte.dev/docs/kit/adapters for more information about adapters.
		adapter: adapter(),
		// Run `npm run dev` to rebuild aliases
		// See: https://svelte.dev/docs/kit/configuration#alias
		alias: {
			'@lib': 'src/lib',
			'@components': 'src/components',
			'@stores': 'src/stores',
			'@routes': 'src/routes',
			'@styles': 'src/styles',
			'@types': 'src/types'
		}
	},

	extensions: ['.svelte', '.svx']
};

export default config;
