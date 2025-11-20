import adapter from '@sveltejs/adapter-node';
// For Vercel deployment, uncomment the line below and comment out adapter-node:
// import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			// adapter-node options for Docker deployment
			out: 'build'
		}),
		alias: {
			$lib: './src/lib'
		}
	}
};

export default config;
