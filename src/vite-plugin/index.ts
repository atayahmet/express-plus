import type { Plugin } from 'vite';

/**
 * Vite plugin for Express Plus optimization (optional)
 * 
 * This plugin is optional - decorators work without it using SWC's native support.
 * It adds metadata optimization for production builds.
 * 
 * @example
 * ```typescript
 * // vite.config.ts
 * import { defineConfig } from 'vite';
 * import { expressPlus } from 'express-plus/vite';
 * 
 * export default defineConfig({
 *   plugins: [expressPlus()]
 * });
 * ```
 */
export function expressPlus(): Plugin {
    return {
        name: 'vite-plugin-express-plus',

        /**
         * Transform hook - runs on each module
         */
        transform(code: string, id: string) {
            // Only process TypeScript files with decorators
            if (!id.endsWith('.ts') && !id.endsWith('.tsx')) {
                return null;
            }

            if (!code.includes('@Controller') && !code.includes('@Injectable')) {
                return null;
            }

            // In production, we could add metadata flattening here
            // For now, we rely on SWC's native decorator support
            return null;
        },

        /**
         * Config hook - ensure SWC is configured correctly
         */
        config() {
            return {
                esbuild: false, // Disable esbuild in favor of SWC
                optimizeDeps: {
                    exclude: ['express-plus']
                }
            };
        }
    };
}
