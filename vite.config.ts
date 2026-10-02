import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

function siteConfigPlugin(): Plugin {
  return {
    name: 'site-config-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/site-config') {
          const dataDir = path.resolve(process.cwd(), 'data')
          const configFile = path.join(dataDir, 'site-config.json')
          if (req.method === 'GET') {
            try {
              const content = fs.readFileSync(configFile, 'utf8')
              res.setHeader('Content-Type', 'application/json')
              res.end(content)
              return
            } catch {
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ logos: [], settings: { assistantEnabled: true, orbitSpeed: 0.24 } }))
              return
            }
          }
          if (req.method === 'PUT') {
            let body = ''
            req.on('data', (chunk: Buffer) => { body += chunk.toString() })
            req.on('end', () => {
              try {
                if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
                fs.writeFileSync(configFile, body, 'utf8')
                res.setHeader('Content-Type', 'application/json')
                res.end(body)
              } catch (e) {
                res.statusCode = 500
                res.end(JSON.stringify({ error: String(e) }))
              }
            })
            return
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), siteConfigPlugin()],
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-dom/client'],
  },
  build: {
    target: 'es2020',
    sourcemap: false,
  },
})
