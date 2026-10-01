export type SiteSettings = {
  assistantEnabled: boolean
  orbitSpeed: number
}

export const defaultSiteSettings: SiteSettings = {
  assistantEnabled: true,
  orbitSpeed: 0.24,
}

export function readSiteSettings(): SiteSettings {
  if (typeof window === 'undefined') return defaultSiteSettings
  try {
    const stored = JSON.parse(window.localStorage.getItem('tibasmart-site-settings') ?? '{}') as Partial<SiteSettings>
    return {
      assistantEnabled: stored.assistantEnabled ?? defaultSiteSettings.assistantEnabled,
      orbitSpeed: Math.min(0.6, Math.max(0.05, Number(stored.orbitSpeed) || defaultSiteSettings.orbitSpeed)),
    }
  } catch {
    return defaultSiteSettings
  }
}

export function saveSiteSettings(settings: SiteSettings) {
  window.localStorage.setItem('tibasmart-site-settings', JSON.stringify(settings))
}
