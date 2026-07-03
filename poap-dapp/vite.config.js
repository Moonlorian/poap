import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  base: '/poap/',
  build: {
    outDir: 'dist'
  },

  plugins: [
    react(),
    svgr({
      svgrOptions: {
        exportType: 'default'
      }
    }),
    basicSsl(),
    nodePolyfills({
      include: ['crypto', 'buffer', 'stream', 'util'],
      globals: {
        Buffer: true,
        global: true,
        process: true
      }
    })
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
      '@multiversx/sdk-wallet',
      '@multiversx/sdk-dapp-ui'
    ]
  },
  server: {
    https: true,
    host: true,
    fs: {
      allow: ['..']
    }
  }
});
