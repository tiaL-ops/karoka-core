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
        // 🔑 Allow Vite to serve both your frontend folder AND the external game-core folder
        allow: [
          path.resolve(__dirname),               // your apps/frontend root
          path.resolve(__dirname, '../game-core')// the external game-core
        ]
      }
    },
    optimizeDeps: {
      // 🔑 Pre-bundle codemirror so imports from game-core won’t get left unresolved
      include: ['codemirror']
    },
    build: {
      commonjsOptions: {
        // 🔑 Make sure any CommonJS in game-core gets converted into ESM/bundled
        include: [
          /node_modules/,                         // default
          path.resolve(__dirname, '../game-core/**')
        ]
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_ENV_NAME),
    },
  }
})
