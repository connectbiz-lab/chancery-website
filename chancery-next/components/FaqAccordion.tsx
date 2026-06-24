'use client'
import { useState } from 'react'

type FaqItem = { question: string; answer: string }
type FaqSection = { title: string; items: FaqItem[] }

export function FaqAccordion({ sections }: { sections: FaqSection[] }) {
  const [openItem, setOpenItem] = useState<string | null>(null)

  return (
    <>
      {sections.map((section, si) => (
        <div key={si} className="faq-section">
          <h2 className="h3 faq-section-title">{section.title}</h2>
          <div className="faq-list">
            {section.items.map((item, ii) => {
              const key = `${si}-${ii}`
              const isOpen = openItem === key
              return (
                <div key={ii} className={`faq-item ${isOpen ? 'open' : ''}`}>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={isOpen}
                    onClick={() => setOpenItem(isOpen ? null : key)}
                  >
                    <span>{item.question}</span>
                    <span className="faq-icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                  </button>
                  <div className="faq-a" hidden={!isOpen}>
                    <p>{item.answer}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}
