import { configDefaults, defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    exclude: [...configDefaults.exclude, 'tests/**'],
    environment: 'happy-dom',
    setupFiles: './test-setup.js',
    deps: {
      moduleDirectories: ['node_modules'],
    },
  },
});
