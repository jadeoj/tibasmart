import fs from 'node:fs'
import path from 'node:path'
import { execSync } from 'node:child_process'

const tmpDir = '/tmp/tibasmart_frames'
fs.rmSync(tmpDir, { recursive: true, force: true })
fs.mkdirSync(tmpDir, { recursive: true })

const fps = 25
const durationSec = 10
const totalFrames = fps * durationSec // 250 frames

console.log(`Generating ${totalFrames} frames...`)

for (let i = 0; i < totalFrames; i++) {
  const t = i / fps // time in seconds (0 to 10)
  const sceneIdx = Math.min(3, Math.floor(t / 2.5)) // 4 scenes, 2.5s each
  const sceneProgress = (t % 2.5) / 2.5 // 0 to 1 inside scene

  let sceneTitle = '01 / CLINICAL EMR &amp; PATIENT FLOW'
  let sceneHeadline = 'Centralized Patient Records'
  let subLine1 = 'Contextual medical histories, vitals'
  let subLine2 = '&amp; triaged doctor queues in real time'
  let activeModule = 0

  if (sceneIdx === 1) {
    sceneTitle = '02 / SCHEDULING &amp; APPOINTMENTS'
    sceneHeadline = 'Predictable Care Scheduling'
    subLine1 = 'Real-time doctor calendar, SMS reminders'
    subLine2 = '&amp; zero queue bottlenecks across clinics'
    activeModule = 1
  } else if (sceneIdx === 2) {
    sceneTitle = '03 / PHARMACY &amp; INVENTORY'
    sceneHeadline = 'Automated Stock &amp; Dispensing'
    subLine1 = 'Batch expiry tracking, digital prescription'
    subLine2 = '&amp; low-stock alerts before supplies run out'
    activeModule = 2
  } else if (sceneIdx === 3) {
    sceneTitle = '04 / BILLING, M-PESA &amp; eTIMS'
    sceneHeadline = 'Instant Claims &amp; Financial Clarity'
    subLine1 = 'M-Pesa automated receipts, SHA/NHIF'
    subLine2 = '&amp; automatic KRA eTIMS invoice generation'
    activeModule = 3
  }

  // Animated elements
  const pulseScale = 1 + Math.sin(t * 5) * 0.08
  const progressPercent = Math.min(100, Math.floor(sceneProgress * 95) + 5)
  const scanLineY = 280 + Math.sin(t * 3) * 180

  const tabNames = ['01 EMR Records', '02 Appointments', '03 Pharmacy &amp; Stock', '04 Billing &amp; eTIMS']
  const tabsSvg = tabNames.map((mod, idx) => {
    const isActive = idx === activeModule
    const bg = isActive ? '#f15f22' : '#f1f5f9'
    const textCol = isActive ? '#ffffff' : '#475569'
    return `
      <g transform="translate(${idx * 230}, 0)">
        <rect width="210" height="38" rx="8" fill="${bg}" />
        <text x="105" y="24" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="${textCol}" text-anchor="middle">${mod}</text>
      </g>
    `
  }).join('')

  const patients = [
    { mrn: 'TS-2026-904', name: 'Wanjiku Kamau', vitals: 'BP 118/76 · HR 70', doc: 'Dr. Amina Odhiambo', status: 'Consultation Complete', tone: '#16a34a', bg: '#f0fdf4' },
    { mrn: 'TS-2026-905', name: 'Brian Omondi', vitals: 'BP 132/84 · SpO2 99%', doc: 'Dr. Kevin Mutua', status: 'Lab Diagnostics Pending', tone: '#f15f22', bg: '#fff7f2' },
    { mrn: 'TS-2026-906', name: 'Faith Chebet', vitals: 'BP 120/80 · Temp 36.8C', doc: 'Dr. Amina Odhiambo', status: 'Pharmacy Dispensing', tone: '#1d8ff0', bg: '#f0f7fa' },
    { mrn: 'TS-2026-907', name: 'Hassan Ali Noor', vitals: 'BP 124/80 · HR 74', doc: 'Dr. Samuel Kiptoo', status: 'M-Pesa / eTIMS Invoiced', tone: '#071a32', bg: '#f1f5f9' },
    { mrn: 'TS-2026-908', name: 'Mercy Akinyi', vitals: 'BP 115/75 · HR 68', doc: 'Dr. Kevin Mutua', status: 'Follow-up Scheduled', tone: '#145e7f', bg: '#eef8fc' },
    { mrn: 'TS-2026-909', name: 'David Kiprono', vitals: 'BP 128/82 · Temp 37.1C', doc: 'Dr. Amina Odhiambo', status: 'Vitals Recorded', tone: '#f15f22', bg: '#fff7f2' },
  ]

  const patientsSvg = patients.map((pt, rIdx) => {
    const rowY = 55 + rIdx * 78
    const isHighlight = rIdx === (Math.floor(t * 1.5) % 6)
    const highlightStroke = isHighlight ? 'stroke="#f15f22" stroke-width="2"' : ''
    return `
      <g transform="translate(15, ${rowY})">
        <rect width="1030" height="66" rx="10" fill="#ffffff" ${highlightStroke} />
        <text x="20" y="38" font-family="monospace" font-size="13" font-weight="bold" fill="#145e7f">${pt.mrn}</text>
        <text x="165" y="38" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="#071a32">${pt.name}</text>
        <text x="365" y="38" font-family="monospace" font-size="12" fill="#64748b">${pt.vitals}</text>
        <text x="575" y="38" font-family="Arial, sans-serif" font-size="14" fill="#334155">${pt.doc}</text>
        <g transform="translate(805, 18)">
          <rect width="150" height="30" rx="6" fill="${pt.bg}" stroke="${pt.tone}" stroke-width="1" />
          <circle cx="15" cy="15" r="4" fill="${pt.tone}" />
          <text x="26" y="19" font-family="Arial, sans-serif" font-weight="bold" font-size="11" fill="${pt.tone}">${pt.status}</text>
        </g>
        <g transform="translate(970, 18)">
          <rect width="45" height="30" rx="6" fill="#f15f22" />
          <text x="22" y="20" font-family="Arial, sans-serif" font-weight="bold" font-size="12" fill="#ffffff" text-anchor="middle">View</text>
        </g>
      </g>
    `
  }).join('')

  const deptList = [
    { dept: 'Front Desk &amp; Patient Triage', val: 'Active (14 queued)' },
    { dept: 'Doctor Consultation Room 3', val: 'In Session · Dr. Amina' },
    { dept: 'Digital Pharmacy &amp; Stores', val: 'Dispensing verified' },
    { dept: 'Billing &amp; eTIMS Tax Compliance', val: 'Synchronized live' },
  ]

  const deptSvg = deptList.map((item, rowIdx) => {
    const rowY = 55 + rowIdx * 64
    return `
      <g transform="translate(0, ${rowY})">
        <rect width="490" height="52" rx="10" fill="#f8fafc" stroke="#edf2f7" stroke-width="1" />
        <circle cx="28" cy="26" r="10" fill="#145e7f" />
        <path d="M 23 26 L 27 30 L 33 22" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
        <text x="50" y="31" font-family="Arial, sans-serif" font-weight="bold" font-size="14" fill="#071a32">${item.dept}</text>
        <text x="470" y="31" font-family="monospace" font-size="12" font-weight="bold" fill="#f15f22" text-anchor="end">${item.val}</text>
      </g>
    `
  }).join('')

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" width="1920" height="1080">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071a32" />
      <stop offset="45%" stop-color="#0c2949" />
      <stop offset="100%" stop-color="#081b33" />
    </linearGradient>
    <linearGradient id="orangeGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#f15f22" />
      <stop offset="100%" stop-color="#ff7b3d" />
    </linearGradient>
    <linearGradient id="blueGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#145e7f" />
      <stop offset="100%" stop-color="#1d8ff0" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="14" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <rect width="1920" height="1080" fill="url(#bgGrad)" />

  <circle cx="280" cy="200" r="380" fill="#145e7f" opacity="0.32" filter="url(#glow)" />
  <circle cx="1650" cy="850" r="420" fill="#f15f22" opacity="0.18" filter="url(#glow)" />
  <circle cx="1200" cy="280" r="320" fill="#1d8ff0" opacity="0.22" filter="url(#glow)" />

  <rect x="80" y="50" width="1760" height="74" rx="16" fill="#ffffff" opacity="0.96" />
  
  <g transform="translate(115, 65)">
    <path d="M 12 6 L 18 6 L 18 12 L 24 12 L 24 18 L 18 18 L 18 24 L 12 24 L 12 18 L 6 18 L 6 12 L 12 12 Z" fill="#145e7f" />
    <text x="32" y="22" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="24" fill="#145e7f">iba</text>
    <text x="32" y="38" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="16" fill="#f15f22">Smart</text>
    <path d="M 82 34 L 115 34 L 105 40 L 80 40 Z" fill="#f15f22" />
    <text x="135" y="30" font-family="monospace" font-size="12" font-weight="bold" fill="#64748b">| HMIS CONNECTED PLATFORM</text>
  </g>

  <g transform="translate(740, 68)">
    ${tabsSvg}
  </g>

  <g transform="translate(1690, 75)">
    <circle cx="14" cy="12" r="${8 * pulseScale}" fill="#f15f22" opacity="0.3" />
    <circle cx="14" cy="12" r="5" fill="#f15f22" />
    <text x="30" y="17" font-family="monospace" font-weight="bold" font-size="12" fill="#071a32">LIVE 24/7</text>
  </g>

  <g transform="translate(80, 160)">
    <rect width="580" height="840" rx="24" fill="#ffffff" opacity="0.97" />
    <rect width="580" height="840" rx="24" fill="none" stroke="#e2e8f0" stroke-width="2" />
    <rect x="0" y="0" width="580" height="10" rx="4" fill="url(#orangeGrad)" />

    <rect x="44" y="50" width="260" height="32" rx="6" fill="#fff5ee" />
    <text x="56" y="71" font-family="monospace" font-weight="bold" font-size="12" fill="#f15f22">${sceneTitle}</text>

    <text x="44" y="135" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="34" fill="#071a32">${sceneHeadline}</text>
    <text x="44" y="180" font-family="Arial, Helvetica, sans-serif" font-size="17" fill="#64748b">
      <tspan x="44" dy="0">${subLine1}</tspan>
      <tspan x="44" dy="28">${subLine2}</tspan>
    </text>

    <g transform="translate(44, 260)">
      <rect width="235" height="130" rx="16" fill="#f0f7fa" stroke="#c8e4f0" stroke-width="1.5" />
      <text x="24" y="38" font-family="monospace" font-size="12" font-weight="bold" fill="#145e7f">SYNC ACCURACY</text>
      <text x="24" y="85" font-family="Arial, sans-serif" font-weight="900" font-size="40" fill="#145e7f">99.98%</text>
      <text x="24" y="112" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Latency &lt;8ms</text>

      <g transform="translate(255, 0)">
        <rect width="235" height="130" rx="16" fill="#fff7f2" stroke="#ffd2bc" stroke-width="1.5" />
        <text x="24" y="38" font-family="monospace" font-size="12" font-weight="bold" fill="#f15f22">WAIT TIME CUT</text>
        <text x="24" y="85" font-family="Arial, sans-serif" font-weight="900" font-size="40" fill="#f15f22">-42 min</text>
        <text x="24" y="112" font-family="Arial, sans-serif" font-size="12" fill="#64748b">Faster handoffs</text>
      </g>
    </g>

    <g transform="translate(44, 430)">
      <text x="0" y="20" font-family="Arial, sans-serif" font-weight="bold" font-size="16" fill="#071a32">DEPARTMENT INTEGRATION STATUS</text>
      ${deptSvg}
    </g>

    <g transform="translate(44, 750)">
      <text x="0" y="0" font-family="monospace" font-size="12" font-weight="bold" fill="#64748b">MODULE VERIFICATION PIPELINE</text>
      <text x="490" y="0" font-family="monospace" font-size="12" font-weight="bold" fill="#f15f22" text-anchor="end">${progressPercent}% COMPLETE</text>
      <rect x="0" y="14" width="490" height="12" rx="6" fill="#e2e8f0" />
      <rect x="0" y="14" width="${(490 * progressPercent) / 100}" height="12" rx="6" fill="url(#orangeGrad)" />
    </g>
  </g>

  <g transform="translate(700, 160)">
    <rect width="1140" height="840" rx="24" fill="#ffffff" opacity="0.98" />
    <rect width="1140" height="840" rx="24" fill="none" stroke="#cbd5e1" stroke-width="2" />

    <rect width="1140" height="64" rx="24" fill="#071a32" />
    <circle cx="34" cy="32" r="7" fill="#ef4444" />
    <circle cx="56" cy="32" r="7" fill="#f59e0b" />
    <circle cx="78" cy="32" r="7" fill="#10b981" />
    
    <text x="120" y="38" font-family="Arial, sans-serif" font-weight="bold" font-size="15" fill="#ffffff">TibaSmart HMIS Workspace</text>
    <text x="350" y="38" font-family="monospace" font-size="13" fill="#94a3b8">https://app.tibasmart.co.ke/hospital-central/dashboard</text>

    <rect x="940" y="16" width="160" height="32" rx="6" fill="#f15f22" />
    <text x="1020" y="37" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffffff" text-anchor="middle">+ New Encounter</text>

    <g transform="translate(40, 95)">
      <g>
        <rect width="335" height="110" rx="14" fill="#f0f7fa" stroke="#c4e1ee" stroke-width="1.5" />
        <text x="24" y="34" font-family="monospace" font-weight="bold" font-size="12" fill="#145e7f">ACTIVE ENCOUNTERS</text>
        <text x="24" y="80" font-family="Arial, sans-serif" font-weight="900" font-size="38" fill="#145e7f">1,284 <tspan font-size="16" font-weight="normal" fill="#64748b">patients</tspan></text>

        <g transform="translate(360, 0)">
          <rect width="335" height="110" rx="14" fill="#fff7f2" stroke="#fed8c3" stroke-width="1.5" />
          <text x="24" y="34" font-family="monospace" font-weight="bold" font-size="12" fill="#f15f22">PHARMACY DISPENSARY</text>
          <text x="24" y="80" font-family="Arial, sans-serif" font-weight="900" font-size="38" fill="#f15f22">418 <tspan font-size="16" font-weight="normal" fill="#64748b">scripts cleared</tspan></text>
        </g>

        <g transform="translate(720, 0)">
          <rect width="340" height="110" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
          <text x="24" y="34" font-family="monospace" font-weight="bold" font-size="12" fill="#071a32">KRA eTIMS &amp; M-PESA</text>
          <text x="24" y="80" font-family="Arial, sans-serif" font-weight="900" font-size="38" fill="#071a32">100% <tspan font-size="16" font-weight="normal" fill="#16a34a">Reconciled</tspan></text>
        </g>
      </g>

      <g transform="translate(0, 140)">
        <rect width="1060" height="540" rx="16" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1" />

        <rect width="1060" height="50" rx="16" fill="#145e7f" />
        <text x="30" y="31" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffffff">MRN / ID</text>
        <text x="180" y="31" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffffff">PATIENT NAME</text>
        <text x="380" y="31" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffffff">TRIAGE / VITALS</text>
        <text x="590" y="31" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffffff">ASSIGNED CLINICIAN</text>
        <text x="820" y="31" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffffff">FLOW STATUS</text>
        <text x="980" y="31" font-family="Arial, sans-serif" font-weight="bold" font-size="13" fill="#ffffff">ACTION</text>

        ${patientsSvg}
      </g>
    </g>

    <line x1="40" y1="${scanLineY}" x2="1100" y2="${scanLineY}" stroke="#f15f22" stroke-width="2" opacity="0.45" />
  </g>

  <g transform="translate(960, 1045)">
    <text x="0" y="0" font-family="Arial, Helvetica, sans-serif" font-weight="bold" font-size="16" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">
      TibaSmart Solutions Limited <tspan fill="#f15f22">·</tspan> Healthcare Operations for Teams That Care <tspan fill="#f15f22">·</tspan> Nairobi, Kenya
    </text>
  </g>
</svg>`

  const frameNum = String(i).padStart(4, '0')
  fs.writeFileSync(path.join(tmpDir, `frame_${frameNum}.svg`), svg)
}

console.log('Rendering SVGs to MP4 via ffmpeg...')

const outputVideo = path.resolve(process.cwd(), 'public/assets/tiba-hmis-module-ad.mp4')

execSync(`ffmpeg -y -framerate 25 -i ${tmpDir}/frame_%04d.svg -c:v libx264 -pix_fmt yuv420p -profile:v high -level 4.1 -movflags +faststart -crf 20 ${outputVideo}`, {
  stdio: 'inherit'
})

console.log('Video generated successfully at:', outputVideo)
fs.rmSync(tmpDir, { recursive: true, force: true })
