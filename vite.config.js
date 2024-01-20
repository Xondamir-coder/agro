import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
	root: 'src',
	publicDir: '../public',
	base: './',
	plugins: [glsl()],
	server: {
		open: true,
	},
});
