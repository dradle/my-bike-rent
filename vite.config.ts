import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Ensures assets are linked relatively
  build: {
    outDir: 'docs', // Output to 'docs' folder for GitHub Pages Classic mode
    emptyOutDir: true,
  }
});