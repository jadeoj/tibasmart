import { ChangeEvent, FormEvent, useMemo, useState } from 'react'

type SiteSettings = {
  brandName: string
  tagline: string
  contactEmail: string
  phone: string
  whatsapp: string
  logoSrc: string
}

type UploadedLogo = { id: string; name: string; src: string; tone: string; uploaded: true }
type Lead = { id: string; name: string; phone: string; organization: string; email: string; role: string; message: string; submittedAt: string }

const SETTINGS_KEY = 'tibasmart-settings'
const LEADS_KEY = 'tibasmart-leads'
const LOGOS_KEY = 'tibasmart-uploaded-logos'
const defaultSettings: SiteSettings = {
  brandName: 'TibaSmart Solutions Limited',
  tagline: 'Healthcare operations, made clearer.',
  contactEmail: 'info@tibasmart.co.ke',
  phone: '+254 715 696 182',
  whatsapp: '+254 722 777 069',
  logoSrc: '/assets/tibasmart-logo.png',
}
const tones = ['blue', 'mint', 'violet', 'orange', 'cyan', 'pink']

function readStorage<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback }
}
function writeStorage(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)) }
function formatDate(value: string) { return new Intl.DateTimeFormat('en-KE', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }

function normalizeFacilityLogo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the logo'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('Could not decode the logo'))
      image.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 360
        canvas.height = 180
        const context = canvas.getContext('2d')
        if (!context) { reject(new Error('Logo processing is unavailable')); return }
        const scale = Math.min((canvas.width - 28) / image.naturalWidth, (canvas.height - 28) / image.naturalHeight)
        const width = Math.max(1, Math.round(image.naturalWidth * scale))
        const height = Math.max(1, Math.round(image.naturalHeight * scale))
        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(image, Math.round((canvas.width - width) / 2), Math.round((canvas.height - height) / 2), width, height)
        resolve(canvas.toDataURL('image/png'))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}

export default function AdminPage() {
  const [settings, setSettings] = useState<SiteSettings>(() => ({ ...defaultSettings, ...readStorage<Partial<SiteSettings>>(SETTINGS_KEY, {}) }))
  const [leads, setLeads] = useState<Lead[]>(() => readStorage<Lead[]>(LEADS_KEY, []))
  const [logos, setLogos] = useState<UploadedLogo[]>(() => readStorage<UploadedLogo[]>(LOGOS_KEY, []))
  const [activeView, setActiveView] = useState<'overview' | 'settings' | 'leads'>('overview')
  const [search, setSearch] = useState('')
  const [notice, setNotice] = useState('')
  const [newLogoName, setNewLogoName] = useState('')
  const [logoProcessing, setLogoProcessing] = useState(false)

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return leads
    return leads.filter((lead) => [lead.name, lead.email, lead.organization, lead.phone, lead.role].some((field) => field.toLowerCase().includes(query)))
  }, [leads, search])

  const showNotice = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(''), 2800) }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    writeStorage(SETTINGS_KEY, settings)
    window.dispatchEvent(new Event('tibasmart-settings-changed'))
    showNotice('Site settings saved')
  }

  function handleLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showNotice('Please choose an image file'); return }
    if (file.size > 2 * 1024 * 1024) { showNotice('Logo must be smaller than 2 MB'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result)
      setSettings((current) => ({ ...current, logoSrc: src }))
      writeStorage(SETTINGS_KEY, { ...settings, logoSrc: src })
      showNotice('Main logo uploaded — save settings to confirm')
    }
    reader.readAsDataURL(file)
  }

  async function handleClientLogoUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { showNotice('Please choose an image file'); return }
    if (file.size > 2 * 1024 * 1024) { showNotice('Logo must be smaller than 2 MB'); return }
    setLogoProcessing(true)
    try {
      const normalizedSrc = await normalizeFacilityLogo(file)
      const name = newLogoName.trim() || file.name.replace(/\.[^/.]+$/, '')
      const logo: UploadedLogo = { id: `logo-${Date.now()}`, name, src: normalizedSrc, tone: tones[logos.length % tones.length], uploaded: true }
      const updated = [logo, ...logos]
      setLogos(updated)
      writeStorage(LOGOS_KEY, updated)
      setNewLogoName('')
      showNotice(`${name} resized and added to the client logo orbit`)
    } catch {
      showNotice('The logo could not be processed — please try another image')
    } finally {
      setLogoProcessing(false)
    }
  }

  function deleteLead(id: string) {
    const updated = leads.filter((lead) => lead.id !== id)
    setLeads(updated)
    writeStorage(LEADS_KEY, updated)
    showNotice('Lead removed')
  }

  function clearLeads() {
    if (!window.confirm('Remove every stored lead from this browser?')) return
    setLeads([])
    writeStorage(LEADS_KEY, [])
    showNotice('All leads cleared')
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <a href="/" className="admin-brand"><img src={settings.logoSrc} alt="TibaSmart" /><span>Admin workspace</span></a>
        <nav className="admin-nav" aria-label="Admin navigation">
          <button className={activeView === 'overview' ? 'is-active' : ''} onClick={() => setActiveView('overview')}><span>▦</span> Overview</button>
          <button className={activeView === 'leads' ? 'is-active' : ''} onClick={() => setActiveView('leads')}><span>↗</span> Demo leads <b>{leads.length}</b></button>
          <button className={activeView === 'settings' ? 'is-active' : ''} onClick={() => setActiveView('settings')}><span>◌</span> Site settings</button>
        </nav>
        <div className="admin-sidebar-foot"><span className="admin-status-dot" /> Local workspace<br /><small>Changes are saved in this browser</small></div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar"><div><p className="eyebrow">TibaSmart control room</p><h1>{activeView === 'overview' ? 'Good morning, admin.' : activeView === 'leads' ? 'Demo leads' : 'Site settings'}</h1></div><a href="/" className="admin-view-site">View website ↗</a></header>
        {notice && <div className="admin-toast" role="status">✓ {notice}</div>}

        {activeView === 'overview' && <>
          <section className="admin-stat-grid" aria-label="Dashboard summary">
            <article className="admin-stat-card"><span className="admin-stat-icon orange">↗</span><div><strong>{leads.length}</strong><span>Total demo leads</span></div><small>All time</small></article>
            <article className="admin-stat-card"><span className="admin-stat-icon blue">◷</span><div><strong>{leads.filter((lead) => Date.now() - new Date(lead.submittedAt).getTime() < 7 * 86400000).length}</strong><span>New this week</span></div><small>Last 7 days</small></article>
            <article className="admin-stat-card"><span className="admin-stat-icon mint">◎</span><div><strong>{logos.length}</strong><span>Uploaded client logos</span></div><small>On the website</small></article>
          </section>
          <section className="admin-content-grid">
            <article className="admin-panel admin-quick-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Quick actions</p><h2>Keep the site current.</h2></div></div><div className="admin-quick-actions"><button onClick={() => setActiveView('settings')}><span>◉</span><b>Update branding</b><small>Logo, contact details, and tagline</small></button><button onClick={() => setActiveView('leads')}><span>↗</span><b>Review new leads</b><small>Respond to incoming demo requests</small></button></div></article>
            <article className="admin-panel admin-recent-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Latest activity</p><h2>Recent leads</h2></div><button className="admin-text-button" onClick={() => setActiveView('leads')}>See all ↗</button></div>{leads.length === 0 ? <div className="admin-empty">No demo requests yet. New submissions will appear here.</div> : <div className="admin-recent-list">{leads.slice(0, 4).map((lead) => <button key={lead.id} onClick={() => setActiveView('leads')}><span className="admin-avatar">{lead.name.slice(0, 1).toUpperCase()}</span><span><b>{lead.name}</b><small>{lead.organization}</small></span><time>{formatDate(lead.submittedAt)}</time></button>)}</div>}</article>
          </section>
        </>}

        {activeView === 'leads' && <section className="admin-panel admin-leads-panel"><div className="admin-panel-heading"><div><p className="eyebrow">Pipeline</p><h2>People interested in TibaSmart</h2></div><button className="admin-danger-button" onClick={clearLeads} disabled={!leads.length}>Clear all</button></div><div className="admin-leads-toolbar"><label className="admin-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, organization, or email" /></label><span className="admin-result-count">{filteredLeads.length} {filteredLeads.length === 1 ? 'lead' : 'leads'}</span></div>{filteredLeads.length === 0 ? <div className="admin-empty large">{leads.length ? 'No leads match your search.' : 'No demo requests have been submitted yet.'}</div> : <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Contact</th><th>Organization</th><th>Role</th><th>Submitted</th><th /></tr></thead><tbody>{filteredLeads.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><span>{lead.email}</span><span>{lead.phone}</span></td><td>{lead.organization}</td><td>{lead.role}</td><td>{formatDate(lead.submittedAt)}</td><td><button className="admin-delete-button" onClick={() => deleteLead(lead.id)} aria-label={`Delete lead from ${lead.name}`}>×</button></td></tr>)}</tbody></table></div>}</section>}

        {activeView === 'settings' && <div className="admin-settings-grid"><form className="admin-panel admin-settings-form" onSubmit={saveSettings}><div className="admin-panel-heading"><div><p className="eyebrow">Brand controls</p><h2>Site identity</h2></div><button className="button button-primary admin-save-button" type="submit">Save changes</button></div><div className="admin-logo-upload"><div className="admin-logo-preview"><img src={settings.logoSrc} alt="Current site logo" /></div><div><strong>Main website logo</strong><p>Use a transparent PNG, JPG, or WEBP under 2 MB.</p><label className="admin-upload-button">Upload new logo<input type="file" accept="image/*" onChange={handleLogoUpload} /></label></div></div><div className="admin-form-fields"><label><span>Brand name</span><input value={settings.brandName} onChange={(event) => setSettings({ ...settings, brandName: event.target.value })} /></label><label><span>Short tagline</span><input value={settings.tagline} onChange={(event) => setSettings({ ...settings, tagline: event.target.value })} /></label><label><span>Contact email</span><input type="email" value={settings.contactEmail} onChange={(event) => setSettings({ ...settings, contactEmail: event.target.value })} /></label><label><span>Primary phone</span><input value={settings.phone} onChange={(event) => setSettings({ ...settings, phone: event.target.value })} /></label><label><span>WhatsApp number</span><input value={settings.whatsapp} onChange={(event) => setSettings({ ...settings, whatsapp: event.target.value })} /></label></div></form><section className="admin-panel admin-client-logos"><div className="admin-panel-heading"><div><p className="eyebrow">Social proof</p><h2>Client logos</h2></div><span className="admin-count-pill">{logos.length} added</span></div><p className="admin-panel-copy">Uploaded logos are automatically resized to the orbit frame and added to the spinning wheel.</p><div className="admin-logo-add"><input value={newLogoName} onChange={(event) => setNewLogoName(event.target.value)} placeholder="Facility name (optional)" /><label className={`admin-upload-button${logoProcessing ? ' is-processing' : ''}`}>{logoProcessing ? 'Resizing…' : 'Choose facility logo'}<input type="file" accept="image/*" onChange={handleClientLogoUpload} disabled={logoProcessing} /></label></div>{logos.length === 0 ? <div className="admin-empty">No additional logos uploaded yet.</div> : <div className="admin-uploaded-list">{logos.map((logo) => <div key={logo.id}><img src={logo.src} alt="" /><span>{logo.name}</span><button onClick={() => { const updated = logos.filter((item) => item.id !== logo.id); setLogos(updated); writeStorage(LOGOS_KEY, updated); showNotice('Client logo removed') }} aria-label={`Remove ${logo.name}`}>×</button></div>)}</div>}</section></div>}
      </main>
    </div>
  )
}
