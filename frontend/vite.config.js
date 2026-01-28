import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: {
            '/auth': 'http://localhost:8000',
            '/categories': 'http://localhost:8000',
            '/transactions': 'http://localhost:8000',
            '/budgets': 'http://localhost:8000',
            '/analytics': 'http://localhost:8000',
            '/reports': 'http://localhost:8000'
        }
    }
})
