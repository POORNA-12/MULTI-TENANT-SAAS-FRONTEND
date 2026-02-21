import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://127.0.0.1:8000',
      '/rbac': 'http://127.0.0.1:8000',
      '/workflows': 'http://127.0.0.1:8000',
      '/organizations': 'http://127.0.0.1:8000',
      '/tenant_auth': 'http://127.0.0.1:8000',
      '/audits': 'http://127.0.0.1:8000',
    }
  }
})
