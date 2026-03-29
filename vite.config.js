import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     '/auth': 'https://multi-tenant-backend-q9ja.onrender.com',
  //     '/rbac': 'https://multi-tenant-backend-q9ja.onrender.com',
  //     '/workflows': 'https://multi-tenant-backend-q9ja.onrender.com',
  //     '/organizations': 'https://multi-tenant-backend-q9ja.onrender.com',
  //     '/tenant_auth': 'https://multi-tenant-backend-q9ja.onrender.com',
  //     '/billing': 'https://multi-tenant-backend-q9ja.onrender.com',
  //     '/audits': 'https://multi-tenant-backend-q9ja.onrender.com',
  //   }
  // }
})
