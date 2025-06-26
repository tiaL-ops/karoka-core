import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  console.log('Loaded env:', env)

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
      // 1) allow serving files from ../game-core
      fs: {
        allow: [path.resolve(__dirname, '../game-core')]
      }
    },
    optimizeDeps: {
      // 2) pre-bundle codemirror so imports from game-core resolve
      include: ['codemirror']
    },
    build: {
      commonjsOptions: {
        // 3) ensure any CJS in game-core is processed
        include: [
          /node_modules/,
          path.resolve(__dirname, '../game-core/**')
        ]
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(env.VITE_ENV_NAME),
    },
  }
})
