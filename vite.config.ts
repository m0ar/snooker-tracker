import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
  plugins: [sveltekit()],
  build: {
    sourcemap: true,
    minify: false,
  },
  test: {
    include: ['src/**/*.{test,spec}.{js,ts}'],
  },
});
