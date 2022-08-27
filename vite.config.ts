import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePluginServer } from './plugins/vite-plugin-server'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePluginServer()],
})
