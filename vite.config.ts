import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
	plugins: [sveltekit(), tailwindcss()],
	preview: {
		allowedHosts: true,
	},
	server: {
		port: 4173,
		allowedHosts: true,
	},
});
