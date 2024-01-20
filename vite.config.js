import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
	root: 'src',
	publicDir: '../public',
	base: './',
	build: {
		outDir: '../dist',
	},
	plugins: [glsl()],
	server: {
		open: true,
	},
});
