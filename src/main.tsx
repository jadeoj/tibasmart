import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import BookDemoPage from './BookDemoPage'
import './styles.css'

function NotFoundPage() {
  return (
    <main className="initial-content">
      <p className="eyebrow">TibaSmart Solutions Limited</p>
      <h1>Page not found</h1>
      <p>This address isn’t available.</p>
      <a className="button button-primary" href="/">Return to website <span aria-hidden="true">↗</span></a>
    </main>
  )
}

const currentPath = window.location.pathname.replace(/\/+$/, '') || '/'
const configuredOrigin = import.meta.env.VITE_SITE_URL?.trim().replace(/\/+$/, '') || window.location.origin

const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement('link')
canonical.rel = 'canonical'
canonical.href = `${configuredOrigin}${currentPath === '/' ? '/' : currentPath}`
if (!canonical.isConnected) document.head.appendChild(canonical)

const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]') ?? document.createElement('meta')
ogUrl.setAttribute('property', 'og:url')
ogUrl.content = canonical.href
if (!ogUrl.isConnected) document.head.appendChild(ogUrl)

document.documentElement.classList.add('js-ready')

const Page = currentPath === '/' ? App : currentPath === '/book-demo' ? BookDemoPage : NotFoundPage

if (currentPath === '/book-demo') {
  document.title = 'Book a TibaSmart Demo — Healthcare Operations'
} else if (currentPath !== '/') {
  document.title = 'Page not found — TibaSmart Solutions'
  document.querySelector('meta[name="robots"]')?.setAttribute('content', 'noindex,nofollow,noarchive')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
)
