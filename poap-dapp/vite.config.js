import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default'
      }
    }),
    basicSsl()
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  define: {
    global: 'globalThis'
  },
  optimizeDeps: {
    include: [
      '@multiversx/sdk-dapp',
      '@multiversx/sdk-core',
      '@multiversx/sdk-dapp-ui'
    ]
  },
  server: {
    https: true,
    fs: {
      allow: ['..']
    }
  }
});
