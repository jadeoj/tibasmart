import { ChangeEvent, useEffect, useState } from 'react'
import type { OrbitLogo } from './components/OrbitField'
import { defaultSiteSettings, readSiteSettings, saveSiteSettings, SiteSettings } from './lib/siteSettings'
import { fetchSharedConfig, saveSharedConfig } from './lib/sharedConfig'

const logoKey = 'tibasmart-uploaded-logos'
const tones = ['blue', 'mint', 'cyan', 'violet', 'orange', 'pink']

function readLogos(): OrbitLogo[] {
  try { return JSON.parse(localStorage.getItem(logoKey) ?? '[]') as OrbitLogo[] } catch { return [] }
}

function AdminPage() {
  const [logos, setLogos] = useState<OrbitLogo[]>(readLogos)
  const [settings, setSettings] = useState<SiteSettings>(readSiteSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchSharedConfig().then((config) => {
      if (!config) return
      setLogos(config.logos)
      setSettings(config.settings)
      localStorage.setItem(logoKey, JSON.stringify(config.logos))
      saveSiteSettings(config.settings)
    })
  }, [])

  const persist = (nextLogos: OrbitLogo[], nextSettings = settings) => {
    localStorage.setItem(logoKey, JSON.stringify(nextLogos))
    saveSiteSettings(nextSettings)
    setSaved(true)
    window.setTimeout(() => setSaved(false), 1800)
    void saveSharedConfig({ logos: nextLogos, settings: nextSettings })
  }

  const updateSettings = (next: SiteSettings) => {
    setSettings(next)
    saveSiteSettings(next)
    persist(logos, next)
  }

  const addLogo = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !file.type.startsWith('image/')) return
    if (file.size > 2 * 1024 * 1024) {
      window.alert('Please choose a logo smaller than 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const next = [...logos, { name: file.name.replace(/\.[^/.]+$/, ''), src: String(reader.result), tone: tones[logos.length % tones.length], uploaded: true }]
      setLogos(next)
      persist(next)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = (name: string) => {
    const next = logos.filter((logo) => logo.name !== name)
    setLogos(next)
    persist(next)
  }

  return (
    <div className="admin-shell">
      <header className="admin-header"><a className="admin-brand" href="/"><img src="/assets/tibasmart-logo.png" alt="TibaSmart Solutions" /></a><div className="admin-header-right"><span className="admin-status"><i /> Shared settings</span><a className="admin-view-link" href="/">View public site ↗</a></div></header>
      <main className="admin-main"><div className="admin-intro"><p className="eyebrow">TIBASMART / ADMIN</p><h1>Shape the experience<br /><span>behind the scenes.</span></h1><p>Manage the client network and a few public-site behaviors without editing code.</p></div>
        <div className="admin-grid">
          <section className="admin-card admin-logo-card"><div className="admin-card-top"><div><span className="admin-card-kicker">01 / CLIENT NETWORK</span><h2>Client logos</h2><p>Upload a logo and it joins the public 3D orbit for every visitor on every device.</p></div><span className="admin-count">{logos.length + 9}<small>in orbit</small></span></div><label className="admin-upload"><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={addLogo} /><span>＋</span><b>Upload a client logo</b><small>PNG, JPG, SVG or WebP · max 2 MB</small></label><div className="admin-logo-grid">{logos.length === 0 && <div className="admin-empty">No custom logos yet. Add one above to see it orbit with the existing client network.</div>}{logos.map((logo) => <div className="admin-logo-item" key={logo.name}><div className="admin-logo-preview"><img src={logo.src} alt={`${logo.name} logo`} /></div><div><b>{logo.name}</b><button type="button" onClick={() => removeLogo(logo.name)}>Remove</button></div></div>)}</div></section>
          <section className="admin-card admin-settings-card"><div><span className="admin-card-kicker">02 / PUBLIC EXPERIENCE</span><h2>Site settings</h2><p>Adjust the interactive layer without touching the content structure.</p></div><div className="admin-setting"><div><b>AI assistant</b><small>Show the TibaSmart guide at bottom right.</small></div><button className={`admin-switch ${settings.assistantEnabled ? 'is-on' : ''}`} type="button" aria-pressed={settings.assistantEnabled} onClick={() => updateSettings({ ...settings, assistantEnabled: !settings.assistantEnabled })}><span /></button></div><div className="admin-setting admin-range-setting"><div><b>Client orbit speed</b><small>Set how quickly the 3D logo network rotates.</small></div><output>{settings.orbitSpeed.toFixed(2)}×</output><input type="range" min="0.05" max="0.6" step="0.01" value={settings.orbitSpeed} onChange={(event) => updateSettings({ ...settings, orbitSpeed: Number(event.target.value) })} /></div><div className={`admin-save-note ${saved ? 'is-visible' : ''}`}>✓ Settings saved in this browser</div></section>
        </div>
        <section className="admin-note"><span>i</span><p><b>How this works</b> Uploaded logos and settings are saved through the shared site configuration API, so every device sees the same client orbit. For Railway, attach a persistent volume and set <code>DATA_DIR</code> to its mount path so the configuration survives redeploys.</p></section>
      </main>
    </div>
  )
}

export default AdminPage
