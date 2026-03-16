import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Deployed Vercel URL – proxies /api calls locally so AI Tutor works in dev
const VERCEL_URL = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'https://smartaiappnew.vercel.app';

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: VERCEL_URL,
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
