import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/** GitHub Pages subpath when `npm run deploy` sets GH_PAGES_BASE (e.g. /repo-name/) */
function ghPagesBase(): string {
  const raw = process.env.GH_PAGES_BASE
  if (raw === undefined || raw === '') return '/'
  if (raw === '/') return '/'
  const s = raw.startsWith('/') ? raw : `/${raw}`
  return s.endsWith('/') ? s : `${s}/`
}

export default defineConfig({
  base: ghPagesBase(),
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    target: 'esnext',
  },
  server: {
    host: true,
  },
})
