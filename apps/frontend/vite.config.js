import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@game-core': path.resolve(__dirname, '../game-core'),
      },
    },
    server: {
      host: true,
      port: parseInt(env.VITE_PORT),
      fs: {
        allow: [
          path.resolve(__dirname),
          path.resolve(__dirname, '../game-core')
        ]
      }
    },
    optimizeDeps: {
      include: ['codemirror']
    },
    build: {
      commonjsOptions: {
        include: [
          /node_modules/,
          path.resolve(__dirname, '../game-core/**')
        ]
      },
      // --- ADD THIS SECTION ---
      rollupOptions: {
        external: ['codemirror']
      }
      // ------------------------
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_ENV_NAME),
    },
  }
})