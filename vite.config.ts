import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 상대 경로로 빌드해야 GitHub Pages와 Capacitor(APK)에서 모두 열립니다.
  base: './',
  // 학원노트 개발 서버(5173, 5174)와 겹치지 않도록 포트를 고정합니다. 이미 쓰고 있으면 다른 포트로 넘어가지 않고 멈춥니다.
  server: { port: 5180, strictPort: true },
  preview: { port: 5181, strictPort: true },
})
