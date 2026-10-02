import http from 'node:http'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 3000)
const dataDir = process.env.DATA_DIR || path.join(root, 'data')
const configPath = path.join(dataDir, 'site-config.json')
const distDir = path.join(root, 'dist')
const defaultConfig = { logos: [], settings: { assistantEnabled: true, orbitSpeed: 0.24 } }

async function readConfig() {
  try { return JSON.parse(await fs.readFile(configPath, 'utf8')) } catch { return defaultConfig }
}

async function writeConfig(config) {
  await fs.mkdir(dataDir, { recursive: true })
  const temporary = `${configPath}.tmp`
  await fs.writeFile(temporary, JSON.stringify(config), 'utf8')
  await fs.rename(temporary, configPath)
}

function sendJson(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end(JSON.stringify(body))
}

async function serveStatic(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname)
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '')
  const candidate = path.resolve(distDir, relative)
  const safePath = candidate.startsWith(`${distDir}${path.sep}`) ? candidate : path.join(distDir, 'index.html')
  try {
    const file = await fs.readFile(safePath)
    const extension = path.extname(safePath)
    const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.mp4': 'video/mp4' }
    response.writeHead(200, { 'Content-Type': types[extension] || 'application/octet-stream', 'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable' })
    response.end(file)
  } catch {
    const fallback = await fs.readFile(path.join(distDir, 'index.html'))
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
    response.end(fallback)
  }
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.url === '/api/health') return sendJson(response, 200, { ok: true })
    if (request.url === '/api/site-config' && request.method === 'GET') return sendJson(response, 200, await readConfig())
    if (request.url === '/api/site-config' && request.method === 'PUT') {
      let body = ''
      for await (const chunk of request) {
        body += chunk
        if (body.length > 24 * 1024 * 1024) return sendJson(response, 413, { error: 'Configuration payload is too large.' })
      }
      const incoming = JSON.parse(body)
      const logos = Array.isArray(incoming.logos) ? incoming.logos.slice(0, 40).filter((logo) => logo && typeof logo.name === 'string' && typeof logo.src === 'string' && logo.src.length < 4 * 1024 * 1024) : []
      const settings = incoming.settings && typeof incoming.settings === 'object' ? {
        assistantEnabled: Boolean(incoming.settings.assistantEnabled),
        orbitSpeed: Math.min(0.6, Math.max(0.05, Number(incoming.settings.orbitSpeed) || 0.24)),
      } : defaultConfig.settings
      const config = { logos, settings }
      await writeConfig(config)
      return sendJson(response, 200, config)
    }
    return serveStatic(request, response)
  } catch (error) {
    console.error(error)
    return sendJson(response, 500, { error: 'Unable to read or save site configuration.' })
  }
})

server.listen(port, '0.0.0.0', () => console.log(`TibaSmart server listening on port ${port}`))
