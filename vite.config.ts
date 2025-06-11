
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// Configuration pour développement local uniquement
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('🔴 Erreur proxy local:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('🔄 Requête locale:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('✅ Réponse locale:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  }
})
