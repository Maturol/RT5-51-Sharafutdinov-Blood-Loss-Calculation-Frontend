import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isTauri = env.VITE_APP_MODE === 'tauri';

  return {
    server: { 
      port: 3000,
      host: isTauri ? 'localhost' : '0.0.0.0', // Tauri - localhost, Browser - IP
      proxy: isTauri ? undefined : { // Tauri без прокси, Browser с прокси
        '/api': {
          target: 'http://192.168.1.72:8080',
          changeOrigin: true,
        },
        '/minio': {
          target: 'http://192.168.1.72:9000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/minio/, '')
        }
      }
    },
    base: "/blood-loss-calc/",
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true,
        },
      manifest: {
        name: "Калькулятор кровопотери",
        short_name: "BloodLossCalc",
        description: "Система расчета кровопотери при хирургических операциях",
        start_url: "/blood-loss-calc/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#112E51",
        orientation: "portrait-primary",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable"
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512", 
            type: "image/png",
            purpose: "any maskable"
          }
        ]
      }
    })
  ],
}
})