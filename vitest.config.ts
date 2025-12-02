import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use globals (describe, it, expect) without imports
    globals: true,

    // Test environment (node for Express)
    environment: "node",

    // Run tests once by default (not watch mode)
    watch: false,

    // Setup file for global imports
    setupFiles: ["./tests/setup.ts"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "node_modules/",
        "dist/",
        "examples/",
        "tests/",
        "*.config.ts",
        "src/vite-plugin/", // Optional: exclude plugin from coverage
      ],
      include: ["src/**/*.ts"],
      all: true,
    },

    // Test file patterns
    include: ["tests/**/*.test.ts"],

    // Timeout for async tests
    testTimeout: 10000,

    // Run tests in parallel
    pool: "forks",

    // TypeScript support
    typecheck: {
      enabled: false, // Use tsc separately for type checking
    },
  },

  // Ensure decorators are enabled
  esbuild: {
    target: "es2022",
    // Disable TypeScript errors in test files for decorator compatibility
    tsconfigRaw: {
      compilerOptions: {
        experimentalDecorators: true,
      },
    },
  },
});
