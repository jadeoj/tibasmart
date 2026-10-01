import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import AdminPage from './AdminPage'
import BookDemoPage from './BookDemoPage'
import './styles.css'

const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim().replace(/\/$/, '')
if (configuredOrigin) {
  const canonical = document.createElement('link')
  canonical.rel = 'canonical'
  canonical.href = `${configuredOrigin}/`
  document.head.appendChild(canonical)

  const ogUrl = document.createElement('meta')
  ogUrl.setAttribute('property', 'og:url')
  ogUrl.content = `${configuredOrigin}/`
  document.head.appendChild(ogUrl)
}

document.documentElement.classList.add('js-ready')

const currentPath = window.location.pathname.replace(/\/$/, '')
const Page = currentPath === '/admin' ? AdminPage : currentPath === '/book-demo' ? BookDemoPage : App

if (window.location.pathname.replace(/\/$/, '') === '/admin') {
  document.title = 'TibaSmart Admin — Client Logos & Site Settings'
  const robots = document.querySelector('meta[name="robots"]')
  robots?.setAttribute('content', 'noindex,nofollow,noarchive')
}

if (currentPath === '/book-demo') {
  document.title = 'Book a TibaSmart Demo — Healthcare Operations'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
