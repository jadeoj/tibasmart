import { FormEvent, useState } from 'react'

export default function BookDemoPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '')
    const email = String(form.get('email') || '')
    const phone = String(form.get('phone') || '')
    const organization = String(form.get('organization') || '')
    const role = String(form.get('role') || '')
    const message = String(form.get('message') || '')
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone}`,
      `Organization: ${organization}`,
      `Role: ${role}`,
      '',
      message || 'I would like to book a TibaSmart demo.',
    ].join('\n')

    setSubmitted(true)
    window.location.href = `mailto:info@tibasmart.co.ke?subject=${encodeURIComponent(`Demo request from ${name}`)}&body=${encodeURIComponent(body)}`
  }

  return (
    <main className="demo-page">
      <header className="demo-page-header">
        <a className="demo-page-brand" href="/"><img src="/assets/tibasmart-logo.png" alt="TibaSmart Solutions" /></a>
        <a className="demo-back-link" href="/">Back to website <span>↗</span></a>
      </header>
      <div className="container demo-page-grid">
        <section className="demo-form-panel" aria-labelledby="demo-page-title">
          <p className="eyebrow">Book a private walkthrough</p>
          <h1 id="demo-page-title">See how your facility can work <span>better.</span></h1>
          <p className="demo-page-lede">Tell us a little about yourself and a TibaSmart specialist will get in touch to arrange a tailored product demonstration.</p>
          {submitted ? (
            <div className="demo-success" role="status"><strong>Your request is ready.</strong><p>Your email app should open with the details filled in. Send it to complete your request, or contact us directly at <a href="mailto:info@tibasmart.co.ke">info@tibasmart.co.ke</a>.</p><a className="button button-primary" href="/">Return to TibaSmart <span>↗</span></a></div>
          ) : (
            <form className="demo-form" onSubmit={handleSubmit}>
              <div className="demo-form-row"><label><span>Full name *</span><input name="name" type="text" autoComplete="name" placeholder="e.g. Amina Otieno" required /></label><label><span>Work email *</span><input name="email" type="email" autoComplete="email" placeholder="you@facility.org" required /></label></div>
              <div className="demo-form-row"><label><span>Phone number *</span><input name="phone" type="tel" autoComplete="tel" placeholder="+254 7XX XXX XXX" required /></label><label><span>Facility / organization *</span><input name="organization" type="text" autoComplete="organization" placeholder="Your hospital or clinic" required /></label></div>
              <label><span>Your role</span><select name="role" defaultValue=""><option value="" disabled>Select your role</option><option>Hospital administrator</option><option>Clinic manager</option><option>Medical director</option><option>IT / systems lead</option><option>Other</option></select></label>
              <label><span>What would you like to see?</span><textarea name="message" rows={4} placeholder="Tell us about your current setup or the modules you are exploring." /></label>
              <button className="button button-primary demo-submit" type="submit">Request my demo <span>→</span></button>
              <p className="demo-privacy">We’ll only use these details to respond to your demo request.</p>
            </form>
          )}
        </section>
        <aside className="demo-video-panel" aria-label="TibaSmart HMIS product tour">
          <div className="demo-video-intro"><span className="demo-video-label">TIBA SMART HMIS</span><span className="demo-video-status"><i /> Product tour</span></div>
          <div className="demo-video-frame"><video autoPlay loop muted playsInline preload="auto" poster="/assets/tiba-hmis-poster.jpg" aria-label="TibaSmart HMIS product demonstration" onLoadedMetadata={(event) => { event.currentTarget.playbackRate = 1.2 }}><source src="/assets/tiba-hmis-module-ad.mp4" type="video/mp4" /></video><span className="demo-video-caption">Your whole operation, connected.</span></div>
          <div className="demo-video-footer"><span>Care · Diagnostics · Pharmacy · Finance</span></div>
        </aside>
      </div>
    </main>
  )
}
