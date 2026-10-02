import { FormEvent, useState } from 'react'

export interface BookDemoModalProps {
  isOpen: boolean
  onClose: () => void
  initialFacilityName?: string
}

export default function BookDemoModal({ isOpen, onClose, initialFacilityName = '' }: BookDemoModalProps) {
  const [submitted, setSubmitted] = useState(false)
  const [leadData, setLeadData] = useState<{ name: string; phone: string; organization: string } | null>(null)

  if (!isOpen) return null

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const name = String(form.get('name') || '').trim()
    const phone = String(form.get('phone') || '').trim()
    const organization = String(form.get('organization') || '').trim()
    const email = String(form.get('email') || '').trim()
    const role = String(form.get('role') || 'Hospital Administrator')
    const message = String(form.get('message') || '').trim()

    const lead = {
      id: `lead-${Date.now()}`,
      name,
      phone,
      organization,
      email,
      role,
      message,
      submittedAt: new Date().toISOString(),
    }

    try {
      const existing = JSON.parse(localStorage.getItem('tibasmart-leads') ?? '[]')
      localStorage.setItem('tibasmart-leads', JSON.stringify([lead, ...existing]))
    } catch {
      // ignore
    }

    setLeadData({ name, phone, organization })
    setSubmitted(true)
  }

  const handleClose = () => {
    setSubmitted(false)
    setLeadData(null)
    onClose()
  }

  return (
    <div className="facility-modal-backdrop" onClick={handleClose}>
      <div className="facility-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        <button
          type="button"
          className="facility-modal-close"
          aria-label="Close demo booking"
          onClick={handleClose}
        >
          ✕
        </button>

        <div style={{ marginBottom: '18px' }}>
          <p className="eyebrow" style={{ marginBottom: '4px' }}>TibaSmart HMIS Demonstration</p>
          <h2 style={{ fontSize: '1.45rem', margin: '4px 0 8px', lineHeight: '1.2' }}>
            Book a Live Facility Walkthrough
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: '0.82rem', margin: 0 }}>
            Experience our clinical records, billing, SHA gateway, and pharmacy modules customized to your hospital setup.
          </p>
        </div>

        {submitted && leadData ? (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#15803d', fontWeight: 800, fontSize: '1.05rem', marginBottom: '12px' }}>
              <span style={{ display: 'grid', placeItems: 'center', width: '26px', height: '26px', borderRadius: '50%', background: '#bbf7d0', color: '#166534', fontSize: '0.9rem' }}>✓</span>
              Request Received Successfully!
            </div>
            <p style={{ color: '#166534', fontSize: '0.88rem', lineHeight: '1.65', margin: '0 0 16px' }}>
              <strong>Thank you, {leadData.name}!</strong> We have received your demonstration request for <strong>{leadData.organization}</strong>. Our clinical team will reach out directly to your phone number (<strong>{leadData.phone}</strong>) to organize a live, tailored system demonstration.
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '16px' }}>
              <a
                className="button button-primary"
                href={`https://wa.me/254722777069?text=${encodeURIComponent(`Hello TibaSmart, I submitted a demo request for ${leadData.organization} under ${leadData.name} (${leadData.phone}).`)}`}
                target="_blank"
                rel="noreferrer"
                style={{ background: '#16a34a', borderColor: '#16a34a', fontSize: '0.74rem' }}
              >
                Instant WhatsApp Chat ↗
              </a>
              <button type="button" className="button button-ghost" onClick={handleClose} style={{ fontSize: '0.74rem' }}>
                Done
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink)' }}>
                <span>Your full name *</span>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="e.g. Dr. Amina Otieno"
                  style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '9px', fontSize: '0.82rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink)' }}>
                <span>Phone number *</span>
                <input
                  name="phone"
                  type="tel"
                  required
                  placeholder="+254 722 000 000"
                  style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '9px', fontSize: '0.82rem' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <label style={{ display: 'grid', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink)' }}>
                <span>Hospital or Clinic name *</span>
                <input
                  name="organization"
                  type="text"
                  required
                  defaultValue={initialFacilityName}
                  placeholder="e.g. Nairobi Premier Medical"
                  style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '9px', fontSize: '0.82rem' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink)' }}>
                <span>Work email *</span>
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="doctor@hospital.co.ke"
                  style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '9px', fontSize: '0.82rem' }}
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink)' }}>
              <span>Your Role</span>
              <select
                name="role"
                defaultValue="Hospital Administrator"
                style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '9px', fontSize: '0.82rem', background: '#fff' }}
              >
                <option>Hospital Administrator / CEO</option>
                <option>Medical Director / Chief of Staff</option>
                <option>Clinic Manager / Operations Lead</option>
                <option>Finance Manager / Billing Lead</option>
                <option>Pharmacist / Stores Supervisor</option>
                <option>ICT / Health Informatics Specialist</option>
              </select>
            </label>

            <label style={{ display: 'grid', gap: '5px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--ink)' }}>
              <span>Modules you are interested in</span>
              <input
                name="message"
                type="text"
                placeholder="e.g. Inpatient EMR, SHA clearing, Automated Pharmacy, eTIMS..."
                style={{ padding: '9px 12px', border: '1px solid var(--line)', borderRadius: '9px', fontSize: '0.82rem' }}
              />
            </label>

            <button
              type="submit"
              className="button button-primary"
              style={{ marginTop: '6px', justifyContent: 'center', width: '100%' }}
            >
              Request Tailored Facility Walkthrough <span>→</span>
            </button>
            <p style={{ margin: 0, fontSize: '0.62rem', color: 'var(--muted)', textAlign: 'center' }}>
              ✓ Our clinical team will reach out directly to your phone number to coordinate the demo.
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
