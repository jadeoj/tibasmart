import { useState } from 'react'

interface Props {
  onOpenDemo: (facilityName?: string) => void
}

export default function HospitalRoiCalculator({ onOpenDemo }: Props) {
  const [patientVolume, setPatientVolume] = useState<number>(120)
  const [facilityType, setFacilityType] = useState<'clinic' | 'centre' | 'hospital'>('centre')

  // Calculate estimates based on clinical Kenyan healthcare benchmarks
  const hoursSavedPerWeek = Math.round((patientVolume * 0.35) * 5)
  const monthlyLeakagePrevented = Math.round(patientVolume * 1450)
  const paperlessFilesSaved = Math.round(patientVolume * 26)

  return (
    <section className="roi-calculator-section section-sand" aria-labelledby="roi-title">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Operational & Financial Impact</p>
            <h2 id="roi-title">Measure the impact on your facility.</h2>
          </div>
          <p>
            Estimate time saved across clinical departments and revenue protected from insurance claim rejections and unbilled services.
          </p>
        </div>

        <div className="roi-calculator-card">
          <div className="roi-controls">
            <div className="roi-control-group">
              <label className="roi-label">
                <span>Facility Scale</span>
                <span className="roi-val-badge">
                  {facilityType === 'clinic' ? 'Outpatient Clinic' : facilityType === 'centre' ? 'Medical Centre / Maternity' : 'Inpatient Hospital'}
                </span>
              </label>
              <div className="roi-type-toggle">
                <button
                  type="button"
                  className={facilityType === 'clinic' ? 'active' : ''}
                  onClick={() => {
                    setFacilityType('clinic')
                    setPatientVolume(45)
                  }}
                >
                  Clinic (20-60/day)
                </button>
                <button
                  type="button"
                  className={facilityType === 'centre' ? 'active' : ''}
                  onClick={() => {
                    setFacilityType('centre')
                    setPatientVolume(120)
                  }}
                >
                  Med Centre (80-200/day)
                </button>
                <button
                  type="button"
                  className={facilityType === 'hospital' ? 'active' : ''}
                  onClick={() => {
                    setFacilityType('hospital')
                    setPatientVolume(320)
                  }}
                >
                  Hospital (200-600/day)
                </button>
              </div>
            </div>

            <div className="roi-control-group">
              <div className="roi-slider-head">
                <span className="roi-label">Average Daily Patient Encounters:</span>
                <b className="roi-slider-value">{patientVolume} patients / day</b>
              </div>
              <input
                type="range"
                min="20"
                max="500"
                step="5"
                value={patientVolume}
                onChange={(e) => setPatientVolume(Number(e.target.value))}
                className="roi-range-input"
              />
              <div className="roi-slider-ticks">
                <span>20 pts</span>
                <span>150 pts</span>
                <span>300 pts</span>
                <span>500+ pts</span>
              </div>
            </div>

            <div className="roi-callout-note">
              <span className="note-icon">💡</span>
              <span>
                Based on audited metrics from 140+ healthcare institutions active on TibaSmart HMIS across Kenya.
              </span>
            </div>
          </div>

          <div className="roi-results-panel">
            <div className="roi-stat-box stat-primary">
              <span className="roi-stat-num">{hoursSavedPerWeek} hrs</span>
              <span className="roi-stat-lbl">Clinical & Triage Time Saved / Week</span>
              <small>Fewer paper cards, faster doctor consults, instant digital Rx</small>
            </div>

            <div className="roi-stat-grid">
              <div className="roi-stat-box stat-secondary">
                <span className="roi-stat-num">KES {monthlyLeakagePrevented.toLocaleString()}</span>
                <span className="roi-stat-lbl">Revenue Protected / Month</span>
                <small>Eradicate unbilled pharmacy/lab tests and claim rejections</small>
              </div>

              <div className="roi-stat-box stat-secondary">
                <span className="roi-stat-num">{paperlessFilesSaved.toLocaleString()}</span>
                <span className="roi-stat-lbl">Physical Files Eliminated / Month</span>
                <small>100% paperless medical record archiving</small>
              </div>
            </div>

            <div className="roi-action-bar">
              <button
                type="button"
                className="button button-primary roi-demo-btn"
                onClick={() => onOpenDemo()}
              >
                Schedule a Tailored Demonstration <span>→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
