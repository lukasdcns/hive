import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'

const useSsl = !process.env.TUNNEL

export default defineConfig({
  plugins: [react(), ...(useSsl ? [basicSsl()] : [])],
  server: {
    allowedHosts: useSsl ? [] : ['.trycloudflare.com'],
  },
})
