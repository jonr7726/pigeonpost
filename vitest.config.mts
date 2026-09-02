import { defineConfig } from 'vitest/config';

// Crypto core runs in a plain Node environment (platform-agnostic TS).
// Component/e2e tests get their own config when they land.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
