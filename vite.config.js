import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({ base: './', build: { rollupOptions: { input: Object.fromEntries(['index','events','space','journal','contact'].map(p => [p, resolve(import.meta.dirname, `${p}.html`)])) } } });
