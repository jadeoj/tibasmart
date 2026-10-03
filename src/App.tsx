import { lazy, Suspense, useEffect, useState } from 'react'
import Assistant from './components/Assistant'
import OrbitField from './components/OrbitField'
import ProductVideoPlayer from './components/ProductVideoPlayer'

type SiteSettings = { logoSrc?: string }
type UploadedLogo = { id: string; name: string; src: string; tone: string; uploaded: true }

function readPublicStorage<T>(key: string, fallback: T): T {
  try { return JSON.parse(localStorage.getItem(key) || '') as T } catch { return fallback }
}

type IconName = 'arrow' | 'check' | 'spark' | 'shield' | 'layers' | 'chart' | 'calendar' | 'wallet' | 'lab' | 'box' | 'message' | 'menu' | 'close' | 'whatsapp'

const modules = [
  { icon: 'layers' as IconName, title: 'Patient records & EMR', copy: 'Give every clinician a complete, contextual view of the patient journey.' },
  { icon: 'calendar' as IconName, title: 'Appointments', copy: 'Make scheduling easier for teams and more predictable for patients.' },
  { icon: 'wallet' as IconName, title: 'Billing & payments', copy: 'Bring invoices, receipts, claims, and collections into one clear flow.' },
  { icon: 'shield' as IconName, title: 'Insurance & claims', copy: 'Track authorizations and claims without the spreadsheet chase.' },
  { icon: 'box' as IconName, title: 'Pharmacy & inventory', copy: 'Keep stock, stores, dispensing, and wastage visible in real time.' },
  { icon: 'lab' as IconName, title: 'Labs & diagnostics', copy: 'Move results between the lab and care team with fewer handoffs.' },
]

const stats = [
  { value: '35%', label: 'faster appointment scheduling' },
  { value: '40%', label: 'lower administrative costs' },
  { value: '100%', label: 'paperless workflows' },
]

const integrations = ['M-Pesa & banking', 'Insurance providers', 'Lab equipment', 'WhatsApp, SMS & email', 'KRA eTIMS']

function Icon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
  const paths: Record<IconName, React.ReactNode> = {
    arrow: <><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    spark: <><path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" /><path d="m19 16 .7 2.3L22 19l-2.3.7L19 22l-.7-2.3L16 19l2.3-.7L19 16Z" /></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z" /><path d="m8.5 12 2.3 2.3 4.7-4.7" /></>,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 12 9 5 9-5" /><path d="m3 16 9 5 9-5" /></>,
    chart: <><path d="M4 19V5" /><path d="M4 19h16" /><path d="m7 15 3-4 3 2 5-6" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" /><path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" /></>,
    wallet: <><path d="M4 6h15a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a3 3 0 0 1 3-3h12" /><path d="M16 13h5" /><circle cx="16" cy="13" r=".5" fill="currentColor" /></>,
    lab: <><path d="M9 3h6M10 3v6l-5 8.5A2 2 0 0 0 6.7 21h10.6a2 2 0 0 0 1.7-3.5L14 9V3" /><path d="M8 15h8" /></>,
    box: <><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" /><path d="M4.5 7.7 12 12l7.5-4.3M12 12v9" /></>,
    message: <><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 9 9 0 0 1-3.3-.6L4 20l1.5-4.2A7.2 7.2 0 0 1 4.5 12 7.5 7.5 0 0 1 12 4.5a7.5 7.5 0 0 1 8 7Z" /><path d="M8 12h.01M12 12h.01M16 12h.01" /></>,
    whatsapp: <><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L4 20l1.2-3.7A8.5 8.5 0 1 1 20.5 11.5Z" /><path d="M8.7 8.6c.2-.4.4-.4.7-.4h.5c.2 0 .4.1.5.4l.6 1.4c.1.3.1.5-.1.7l-.5.6c.5 1 1.3 1.7 2.3 2.2l.6-.5c.2-.2.4-.2.7-.1l1.4.7c.3.1.4.3.3.6-.2.8-.8 1.3-1.5 1.5-1.3.2-3.2-.8-4.4-2-1.2-1-2.2-2.9-2.1-4.1.1-.4.4-.8.9-1Z" /></>,
    menu: <><path d="M4 7h16M4 12h16M4 17h16" /></>,
    close: <><path d="m6 6 12 12M18 6 6 18" /></>,
  }
  return <svg {...common}>{paths[name]}</svg>
}

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => readPublicStorage('tibasmart-settings', {}))
  const [uploadedLogos, setUploadedLogos] = useState<UploadedLogo[]>(() => readPublicStorage('tibasmart-uploaded-logos', []))

  useEffect(() => {
    const refreshSiteSettings = () => {
      setSiteSettings(readPublicStorage('tibasmart-settings', {}))
      setUploadedLogos(readPublicStorage('tibasmart-uploaded-logos', []))
    }
    window.addEventListener('storage', refreshSiteSettings)
    window.addEventListener('tibasmart-settings-changed', refreshSiteSettings)
    return () => {
      window.removeEventListener('storage', refreshSiteSettings)
      window.removeEventListener('tibasmart-settings-changed', refreshSiteSettings)
    }
  }, [])

  const closeMobileNav = () => setMobileNavOpen(false)

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })

    const sections = Array.from(document.querySelectorAll<HTMLElement>('main section[id]'))
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
      if (visible?.target.id) setActiveSection(visible.target.id)
    }, { rootMargin: '-18% 0px -58% 0px', threshold: [0.05, 0.25, 0.5] })
    sections.forEach((section) => observer.observe(section))

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver.unobserve(entry.target)
        }
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    const unfoldTargets = document.querySelectorAll<HTMLElement>('.section-heading, .platform-story, .workflow-panel, .stat, .product-demo-copy, .product-video-shell, .module-card, .integration-layout, .integration-chip, .security-copy, .security-visual, .cta-card, .about-healthcare-image, .orbit-wrap')
    unfoldTargets.forEach((element, index) => {
      element.classList.add('scroll-unfold')
      element.style.setProperty('--unfold-delay', `${Math.min(index % 5, 4) * 70}ms`)
      revealObserver.observe(element)
    })
    document.querySelectorAll('.motion-reveal').forEach((element) => revealObserver.observe(element))

    return () => {
      window.removeEventListener('scroll', onScroll)
      observer.disconnect()
      revealObserver.disconnect()
    }
  }, [])

  return (
    <div className="site-shell">
      <header className={`site-header ${headerScrolled ? 'is-scrolled' : ''}`}>
        <div className="container header-inner">
          <a className="brand" href="#top" aria-label="TibaSmart home" onClick={closeMobileNav}>
            <img src={siteSettings.logoSrc || '/assets/tibasmart-logo.png'} alt="TibaSmart Solutions" />
          </a>
          <button className="mobile-nav-toggle" type="button" aria-expanded={mobileNavOpen} aria-controls="main-nav" aria-label={mobileNavOpen ? 'Close navigation' : 'Open navigation'} onClick={() => setMobileNavOpen((open) => !open)}>
            <Icon name={mobileNavOpen ? 'close' : 'menu'} />
          </button>
            <nav id="main-nav" className={`main-nav ${mobileNavOpen ? 'is-open' : ''}`} aria-label="Main navigation">
            <a className={activeSection === 'about' ? 'is-active' : ''} href="#about" onClick={closeMobileNav}>About</a>
            <a className={activeSection === 'platform' ? 'is-active' : ''} href="#platform" onClick={closeMobileNav}>Platform</a>
            <a className={activeSection === 'modules' ? 'is-active' : ''} href="#modules" onClick={closeMobileNav}>Modules</a>
            <a className={activeSection === 'product-demo' ? 'is-active' : ''} href="#product-demo" onClick={closeMobileNav}>Product tour</a>
            <a className={activeSection === 'security' ? 'is-active' : ''} href="#security" onClick={closeMobileNav}>Trust & security</a>
            <a className="nav-cta" href="/book-demo" onClick={closeMobileNav}>Book a demo <Icon name="arrow" /></a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero section-dark">
          <div className="hero-grid" aria-hidden="true" />
          <div className="orbital-glow orbital-glow-one" aria-hidden="true" />
          <div className="orbital-glow orbital-glow-two" aria-hidden="true" />
          <div className="container hero-content">
            <div className="hero-copy">
              <p className="eyebrow eyebrow-light"><span className="eyebrow-dot" /> Healthcare operations, connected</p>
              <h1>Make every care moment <span>move better.</span></h1>
              <p className="hero-lede">One calm, intelligent layer for the clinical, financial, and administrative work behind great care.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="/book-demo">Request a free demo <Icon name="arrow" /></a>
                <a className="button button-ghost" href="#platform">Explore the platform <Icon name="arrow" /></a>
              </div>
              <div className="hero-proof"><span className="proof-mark"><Icon name="check" /></span><span>Built for clinics, hospitals, and multi-branch facilities.</span></div>
            </div>
            <div className="hero-visual" aria-label="Illustration of connected healthcare workflows">
              <div className="dashboard-orbit dashboard-orbit-back" aria-hidden="true" />
              <div className="dashboard-orbit dashboard-orbit-front" aria-hidden="true" />
              <div className="dashboard-card dashboard-main-card">
                <div className="dashboard-topline"><span className="tiny-label">TODAY / OVERVIEW</span><span className="live-pill"><span /> Live</span></div>
                <div className="dashboard-title-row"><div><span className="dashboard-kicker">Care operations</span><strong>Good morning, Dr. Amina</strong></div><span className="avatar">AM</span></div>
                <div className="dashboard-chart"><div className="chart-axis"><span>120</span><span>80</span><span>40</span><span>0</span></div><div className="chart-line" /><div className="chart-dots"><i /><i /><i /><i /><i /><i /></div></div>
                <div className="dashboard-foot"><span><b>1,284</b> active patients</span><span className="trend">+12.4% <Icon name="arrow" /></span></div>
              </div>
              <div className="dashboard-card dashboard-mini-card mini-appointments"><span className="mini-icon mini-blue"><Icon name="calendar" /></span><span><b>36</b><small>appointments today</small></span></div>
              <div className="dashboard-card dashboard-mini-card mini-alert"><span className="mini-icon mini-mint"><Icon name="spark" /></span><span><b>All clear</b><small>inventory health</small></span></div>
              <div className="hero-float-label label-one"><span>Connected teams</span><b>06</b></div>
              <div className="hero-float-label label-two"><span>Patient flow</span><b>+35%</b></div>
            </div>
          </div>
          <div className="container hero-footer">
            <span>Trusted infrastructure for teams that care</span>
            <div className="hero-footer-line" aria-hidden="true" />
            <span className="hero-footer-status"><span className="status-pulse" /> Secure by design</span>
          </div>
        </section>

        <section id="about" className="logo-trust section-light motion-reveal" aria-labelledby="trust-title">
          <div className="container trust-layout">
            <div className="trust-copy">
              <p className="eyebrow">About TibaSmart Solutions</p>
              <h2 id="trust-title">Healthcare operations for teams that care.</h2>
              <p>TibaSmart Solutions Limited is a Kenya healthcare technology company focused on improving medical-practice efficiency and patient quality of care. Our HMIS keeps every team in sync — from front desk to pharmacy.</p>
              <figure className="about-healthcare-image"><img src="/assets/tibasmart-healthcare-team.webp" alt="Healthcare team collaborating around digital care operations" loading="lazy" /><figcaption><span className="status-pulse" /> Technology that keeps care teams in sync</figcaption></figure>
              <a className="about-map-link" href="https://www.google.com/maps/search/?api=1&query=TibaSmart+Solutions+Limited+Nairobi+Kenya" target="_blank" rel="noreferrer">Find TibaSmart Solutions on Google Maps ↗</a>
              <a className="text-link" href="mailto:info@tibasmart.co.ke?subject=Talk%20to%20a%20TibaSmart%20expert">Talk to an expert <Icon name="arrow" /></a>
            </div>
            <div className="orbit-wrap"><OrbitField uploadedLogos={uploadedLogos} /></div>
          </div>
        </section>

        <section id="platform" className="platform section-sand motion-reveal" aria-labelledby="platform-title">
          <div className="container">
            <div className="section-heading platform-heading"><div><p className="eyebrow">The operating layer</p><h2 id="platform-title">Less chasing. More clarity.</h2></div><p>Everything your facility needs to make confident decisions, coordinate better, and spend more time where it matters.</p></div>
            <div className="platform-grid">
              <article className="platform-story"><div className="story-number">01</div><h3>Turn fragmented workflows into one clear view.</h3><p>Connect the work that happens before, during, and after the consultation. TibaSmart brings patient records, scheduling, billing, inventory, and reporting into one intelligent platform.</p><div className="story-list"><span><Icon name="check" /> One source of truth</span><span><Icon name="check" /> Fewer manual handoffs</span><span><Icon name="check" /> Decisions with context</span></div></article>
              <div className="workflow-panel"><div className="workflow-panel-head"><span className="tiny-label">WORKFLOW / LIVE</span><span className="workflow-live"><span /> Synchronized</span></div><div className="workflow-steps"><div className="workflow-step is-done"><span className="workflow-icon"><Icon name="calendar" /></span><div><b>Appointment booked</b><small>Front desk · 09:42</small></div><Icon name="check" /></div><div className="workflow-connector" /><div className="workflow-step is-active"><span className="workflow-icon"><Icon name="layers" /></span><div><b>Patient record updated</b><small>Clinical team · now</small></div><span className="workflow-spinner" /></div><div className="workflow-connector" /><div className="workflow-step"><span className="workflow-icon"><Icon name="wallet" /></span><div><b>Claim ready to submit</b><small>Finance · next</small></div><span className="workflow-time">12 min</span></div></div><div className="workflow-bottom"><span>Across 6 connected departments</span><div className="department-dots"><i /><i /><i /><i /><i /><i /></div></div></div>
            </div>
            <div className="stats-row">{stats.map((stat) => <div className="stat" key={stat.value}><strong>{stat.value}</strong><span>{stat.label}</span></div>)}</div>
          </div>
        </section>

        <section id="product-demo" className="product-demo section-dark motion-reveal" aria-labelledby="product-demo-title">
          <div className="container product-demo-layout">
            <div className="product-demo-copy">
              <p className="eyebrow eyebrow-light">See TibaSmart in action</p>
              <h2 id="product-demo-title">One HMIS. Every module in view.</h2>
              <p>Take a quick tour of the TibaSmart HMIS dashboard and see how care, diagnostics, pharmacy, finance, and operations stay connected in one calm workspace.</p>
              <div className="product-demo-points"><span><b>01</b> Connected modules</span><span><b>02</b> Clear operational visibility</span><span><b>03</b> Built for everyday care teams</span></div>
              <a className="button button-light" href="#modules">Explore every module <Icon name="arrow" /></a>
            </div>
            <div className="product-video-shell">
              <ProductVideoPlayer
                poster="/assets/tiba-hmis-poster.jpg"
                src="/assets/tiba-hmis-module-ad.mp4"
                caption="EMR · Care · Diagnostics · Pharmacy · Finance & eTIMS"
              />
            </div>
          </div>
        </section>

        <section id="modules" className="modules section-light motion-reveal" aria-labelledby="modules-title">
          <div className="container"><div className="section-heading modules-heading"><div><p className="eyebrow">One platform. Every department.</p><h2 id="modules-title">The details that keep care moving.</h2></div><p>Modular by design, so you can start where the need is greatest and grow at your own pace.</p></div><div className="module-grid">{modules.map((module, index) => <article className="module-card" key={module.title}><div className={`module-icon module-icon-${index % 3}`}><Icon name={module.icon} /></div><span className="module-index">0{index + 1}</span><h3>{module.title}</h3><p>{module.copy}</p><a href="mailto:info@tibasmart.co.ke?subject=Ask%20about%20TibaSmart%20modules" aria-label={`Learn more about ${module.title}`}>Learn more <Icon name="arrow" /></a></article>)}</div></div>
        </section>

        <section id="integrations" className="integration-band section-dark motion-reveal" aria-labelledby="integrations-title">
          <div className="container integration-layout"><div><p className="eyebrow eyebrow-light">Smart integrations</p><h2 id="integrations-title">Connect the tools your team already trusts.</h2><p>Automate the handoffs that slow care down. Keep your operational ecosystem connected, from payment rails to patient messages.</p><a className="button button-light" href="mailto:info@tibasmart.co.ke?subject=Discuss%20TibaSmart%20integrations">Discuss integrations <Icon name="arrow" /></a></div><div className="integration-cloud">{integrations.map((item, index) => <div className={`integration-chip chip-${index}`} key={item}><span className="chip-glyph">{['M', '↗', '◌', '✦', 'K'][index]}</span>{item}</div>)}<span className="cloud-orbit cloud-orbit-a" aria-hidden="true" /><span className="cloud-orbit cloud-orbit-b" aria-hidden="true" /><span className="cloud-cross cross-a" aria-hidden="true" /><span className="cloud-cross cross-b" aria-hidden="true" /></div></div>
        </section>

        <section id="security" className="security section-light motion-reveal" aria-labelledby="security-title">
          <div className="container security-layout"><div className="security-visual"><div className="security-ring ring-outer" /><div className="security-ring ring-inner" /><div className="security-lock"><Icon name="shield" /><span>Protected</span></div><span className="security-token token-a">Access control</span><span className="security-token token-b">Audit trails</span><span className="security-token token-c">Data protection</span></div><div className="security-copy"><p className="eyebrow">Trust, built in</p><h2 id="security-title">Your data is part of the care standard.</h2><p>Enterprise-grade security should feel like a quiet confidence, not a daily interruption. TibaSmart is built to protect sensitive workflows while keeping the right information available to the right people.</p><div className="security-points"><span><Icon name="check" /><b>Role-based access</b><small>Give every team member the view they need.</small></span><span><Icon name="check" /><b>Reliable by design</b><small>Keep essential operations moving when the day gets busy.</small></span><span><Icon name="check" /><b>Clear auditability</b><small>Make every important action traceable and accountable.</small></span></div></div></div>
        </section>

        <section className="cta-section section-sand" aria-labelledby="cta-title"><div className="container cta-card"><div className="cta-copy"><p className="eyebrow">Ready when you are</p><h2 id="cta-title">Give your team a clearer way to care.</h2><p>See how TibaSmart can fit the way your facility already works — and where it can help you work better.</p></div><div className="cta-actions"><a className="button button-primary" href="/book-demo">Request a free demo <Icon name="arrow" /></a><a className="contact-note" href="tel:+254715696182">Or call <b>+254 715 696 182</b></a></div></div></section>
      </main>

      {assistantOpen && <Assistant onClose={() => setAssistantOpen(false)} />}
      <button className={`assistant-launcher ${assistantOpen ? 'is-hidden' : ''}`} type="button" onClick={() => setAssistantOpen(true)} aria-label="Open TibaSmart AI assistant"><span className="assistant-launcher-spark">✦</span><span><b>Ask TibaSmart</b><small>AI guide</small></span></button>
      <footer className="site-footer"><div className="container footer-top"><div className="footer-brand"><a className="brand" href="#top"><img src={siteSettings.logoSrc || '/assets/tibasmart-logo.png'} alt="TibaSmart Solutions" /></a><p>Healthcare operations, made clearer.</p><div className="footer-socials" aria-label="TibaSmart social profiles"><a href="https://www.facebook.com/people/TibaSmart-limited-Solutions/61575493359410/" target="_blank" rel="noreferrer" aria-label="TibaSmart on Facebook">f</a><a href="https://www.instagram.com/tibasmartsolutions/" target="_blank" rel="noreferrer" aria-label="TibaSmart on Instagram">◎</a><a href="https://www.google.com/maps/search/?api=1&query=TibaSmart+Solutions+Limited+Nairobi+Kenya" target="_blank" rel="noreferrer" aria-label="Find TibaSmart Solutions on Google Maps">⌖</a><a className="footer-whatsapp" href="https://wa.me/254722777069?text=Hello%20TibaSmart%20Solutions%2C%20I%27d%20like%20to%20learn%20more." target="_blank" rel="noreferrer" aria-label="Chat with TibaSmart on WhatsApp"><Icon name="whatsapp" /></a></div></div><div className="footer-links"><div><span>Explore</span><a href="#about">About</a><a href="#platform">Platform</a><a href="#modules">Modules</a><a href="#integrations">Integrations</a></div><div><span>Connect</span><a href="mailto:info@tibasmart.co.ke">info@tibasmart.co.ke</a><a href="tel:+254722777069">+254 722 777 069</a><a href="https://www.google.com/maps/search/?api=1&query=TibaSmart+Solutions+Limited+Nairobi+Kenya" target="_blank" rel="noreferrer">Google Maps ↗</a><span>Mon – Fri · 8:00 – 17:00</span></div></div></div><div className="container footer-bottom"><span>© 2026 TibaSmart Solutions Limited</span><div><a href="#top">Privacy</a><a href="#top">Terms</a><a href="#top">Back to top ↑</a></div></div></footer>
    </div>
  )
}

export default App
