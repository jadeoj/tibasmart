import { FormEvent, useState } from 'react'

type Message = { from: 'assistant' | 'user'; text: string }

type AssistantProps = { onClose: () => void }

const answers: Array<{ keywords: string[]; answer: string }> = [
  { keywords: ['demo', 'book', 'trial'], answer: 'I can help you get started. Use the “Request a free demo” button and the TibaSmart team will show how the platform fits your facility.' },
  { keywords: ['price', 'cost', 'pricing'], answer: 'TibaSmart is modular, so pricing depends on your facility size and the workflows you need. The team can prepare a tailored quote after a short discovery call.' },
  { keywords: ['feature', 'module', 'emr', 'appointment', 'billing', 'pharmacy', 'laboratory', 'insurance'], answer: 'TibaSmart covers patient registration and EMR, appointments, billing and payments, insurance claims, pharmacy and inventory, laboratory integrations, reporting, and inter-department communication.' },
  { keywords: ['security', 'secure', 'data', 'privacy'], answer: 'The platform is designed around role-based access, traceable activity, data protection, and reliable workflows for clinics, hospitals, and multi-branch facilities.' },
  { keywords: ['integrat', 'mpesa', 'm-pesa', 'whatsapp', 'etims', 'bank'], answer: 'TibaSmart can connect payment and banking systems, insurance providers, laboratory equipment, WhatsApp, SMS, email, and KRA eTIMS workflows.' },
  { keywords: ['contact', 'phone', 'email', 'talk'], answer: 'You can reach the team at info@tibasmart.co.ke or call +254 722 777 069, Monday to Friday from 8:00 AM to 5:00 PM.' },
]

function getAnswer(value: string) {
  const lower = value.toLowerCase()
  const match = answers.find((item) => item.keywords.some((keyword) => lower.includes(keyword)))
  return match?.answer ?? 'I can help with demos, modules, integrations, security, pricing, and contact details. What would you like to know?'
}

function Assistant({ onClose }: AssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    { from: 'assistant', text: 'Hi, I’m the TibaSmart guide. Ask me about the platform, modules, integrations, or booking a demo.' },
  ])
  const [value, setValue] = useState('')

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    setMessages((current) => [...current, { from: 'user', text: trimmed }, { from: 'assistant', text: getAnswer(trimmed) }])
    setValue('')
  }

  return (
    <aside className="assistant-panel" aria-label="TibaSmart AI assistant">
      <div className="assistant-header">
        <div className="assistant-identity"><span className="assistant-orb">✦</span><span><b>TibaSmart AI</b><small>Online guide</small></span></div>
        <button type="button" className="assistant-close" onClick={onClose} aria-label="Close assistant">×</button>
      </div>
      <div className="assistant-messages" aria-live="polite">
        {messages.map((message, index) => <div className={`assistant-message assistant-message-${message.from}`} key={`${message.from}-${index}`}>{message.text}</div>)}
      </div>
      <div className="assistant-prompts"><button type="button" onClick={() => setValue('What modules does TibaSmart cover?')}>Modules</button><button type="button" onClick={() => setValue('How do I book a demo?')}>Book a demo</button></div>
      <form className="assistant-form" onSubmit={submit}><input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ask TibaSmart…" aria-label="Ask TibaSmart a question" /><button type="submit" aria-label="Send question">↑</button></form>
      <p className="assistant-disclaimer">AI guide · For a tailored answer, <a href="mailto:info@tibasmart.co.ke">talk to our team</a>.</p>
    </aside>
  )
}

export default Assistant
