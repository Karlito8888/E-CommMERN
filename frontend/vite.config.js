import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import * as sass from 'sass'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api/": "http://localhost:5000",
      "/uploads/": "http://localhost:5000",
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: [path.resolve(__dirname, './src/assets/styles')],
        implementation: sass,
        api: 'modern',
        sassOptions: {
          outputStyle: 'expanded',
          sourceMap: true,
          silenceDeprecations: ['legacy-js-api']
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@styles': path.resolve(__dirname, './src/assets/styles')
    }
  }
});