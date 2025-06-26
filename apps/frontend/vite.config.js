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
      // --- ADD THIS DEDUPE SECTION ---
      // This helps Vite resolve dependencies consistently in a monorepo-like setup
      dedupe: ['codemirror', 'react', 'react-dom'] 
      // It's good practice to also dedupe other shared dependencies like react
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
      // --- REMOVE THE ROLLUPOPTIONS SECTION ---
      // rollupOptions: {
      //   external: ['codemirror'] // This was causing the browser error
      // }
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_ENV_NAME),
    },
  }
})