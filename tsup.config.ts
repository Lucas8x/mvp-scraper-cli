import { defineConfig } from 'tsup';

export default defineConfig({
  target: 'esnext',
  clean: true,
  format: ['esm'],
  outDir: './dist/',
});
