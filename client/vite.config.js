import os from 'node:os'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

function lanIp() {
  for (const addrs of Object.values(os.networkInterfaces())) {
    for (const a of addrs || []) {
      const v4 = a.family === 'IPv4' || a.family === 4
      if (v4 && !a.internal) return a.address
    }
  }
  return '127.0.0.1'
}

const host = lanIp()

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    hmr: {
      host
    },
    proxy: {
      '/api': 'http://127.0.0.1:5001'
    }
  }
})
