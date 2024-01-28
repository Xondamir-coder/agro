import glsl from 'vite-plugin-glsl';
import { defineConfig } from 'vite';

export default defineConfig({
	root: 'src',
	publicDir: '../public',
	base: './',
	build: {
		outDir: '../dist',
		emptyOutDir: true,
	},
	plugins: [glsl()],
	server: {
		open: true,
	},
	assetsInclude: ['**/*.glb'],
});
