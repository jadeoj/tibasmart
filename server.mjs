import http from 'node:http'
import fsSync from 'node:fs'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 3000)
const dataDir = process.env.DATA_DIR || path.join(root, 'data')
const configPath = path.join(dataDir, 'site-config.json')
const distDir = path.join(root, 'dist')
const publicDir = path.join(root, 'public')
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

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
}

async function serveStatic(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname)
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '')
  
  // Look in dist first, then public directory as fallback
  let candidate = path.resolve(distDir, relative)
  let foundFile = false
  try {
    const s = await fs.stat(candidate)
    if (s.isFile()) foundFile = true
  } catch {}

  if (!foundFile) {
    const publicCandidate = path.resolve(publicDir, relative)
    try {
      const s = await fs.stat(publicCandidate)
      if (s.isFile()) {
        candidate = publicCandidate
        foundFile = true
      }
    } catch {}
  }

  if (foundFile) {
    try {
      const stat = await fs.stat(candidate)
      const extension = path.extname(candidate)
      const contentType = MIME_TYPES[extension] || 'application/octet-stream'

      // Video range request streaming (HTTP 206) for smooth playback in Safari & Chrome
      const range = request.headers.range
      if (range && extension === '.mp4') {
        const parts = range.replace(/bytes=/, '').split('-')
        const start = parseInt(parts[0], 10)
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1
        const chunkSize = (end - start) + 1
        const stream = fsSync.createReadStream(candidate, { start, end })

        response.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': contentType,
        })
        stream.pipe(response)
        return
      }

      response.writeHead(200, {
        'Content-Type': contentType,
        'Content-Length': stat.size,
        'Accept-Ranges': 'bytes',
        'Cache-Control': extension === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
      })
      const stream = fsSync.createReadStream(candidate)
      stream.pipe(response)
      return
    } catch (e) {
      console.error('Error streaming static file:', e)
    }
  }

  // SPA fallback to index.html
  try {
    const fallbackPath = path.join(distDir, 'index.html')
    const fallback = await fs.readFile(fallbackPath)
    response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' })
    response.end(fallback)
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain' })
    response.end('Not Found')
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
