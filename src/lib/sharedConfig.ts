import type { OrbitLogo } from '../components/OrbitField'
import type { SiteSettings } from './siteSettings'

export type SharedSiteConfig = {
  logos: OrbitLogo[]
  settings: SiteSettings
}

export async function fetchSharedConfig(): Promise<SharedSiteConfig | null> {
  try {
    const response = await fetch('/api/site-config', { headers: { Accept: 'application/json' } })
    if (!response.ok) return null
    return await response.json() as SharedSiteConfig
  } catch {
    return null
  }
}

export async function saveSharedConfig(config: SharedSiteConfig): Promise<boolean> {
  try {
    const response = await fetch('/api/site-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(config),
    })
    return response.ok
  } catch {
    return false
  }
}
