import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
<<<<<<< HEAD
      '/api': 'http://127.0.0.1:8000',
=======
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
>>>>>>> 0dd4b50f06a16c2d17639cce34f89964ed7958a3
    },
  },
})
