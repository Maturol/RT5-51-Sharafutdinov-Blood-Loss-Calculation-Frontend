import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  server: { 
    port: 3000,
    https: {
      key: fs.readFileSync(path.join(__dirname, 'ssl/localhost.key')),
      cert: fs.readFileSync(path.join(__dirname, 'ssl/localhost.crt')),
    },
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/minio': {
        target: 'http://localhost:9000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/minio\//, '/'),
      },
    },
    host: true,
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
        start_url: "/blood-loss-calc/",
        display: "standalone",
        background_color: "#ffffff",
        theme_color: "#112E51",
        orientation: "portrait-primary",
        icons: [
          {
            src: "icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ],
      }
    })
  ],
})