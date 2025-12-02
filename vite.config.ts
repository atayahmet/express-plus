import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                'vite-plugin/index': resolve(__dirname, 'src/vite-plugin/index.ts')
            },
            name: 'ExpressPlus',
            formats: ['es'],
            fileName: (format, entryName) => `${entryName}.js`
        },
        rollupOptions: {
            external: ['express', 'vite', '@swc/core'],
            output: {
                preserveModules: false
            }
        },
        sourcemap: true,
        target: 'node18'
    }
});
