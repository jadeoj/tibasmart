import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
