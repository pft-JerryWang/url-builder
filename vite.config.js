import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/url-builder/', // 這裡要跟你的 Repository 名稱一樣
})
