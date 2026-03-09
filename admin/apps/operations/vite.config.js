import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import qiankun from 'vite-plugin-qiankun'

export default defineConfig({
  plugins: [react(), tailwindcss(), qiankun('operations', { useDevMode: true })],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  server: {
    port: 5181,
    headers: { 'Access-Control-Allow-Origin': '*' },
    proxy: { '/api': 'http://localhost:3001' },
  },
})
