import { useState } from "react";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import "./pages.css";
import "./FAQPage.css";

export function FAQPage() {
  const page = useAsync(() => api.page("faq"), []);
  const faq = useAsync(() => api.faq(), []);
  const [openItem, setOpenItem] = useState<string | null>(null);

  if (page.loading || faq.loading) return <Loading />;
  const p = page.data;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "FAQ"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow}
        heading={p?.hero_heading ?? "Frequently asked questions"}
        subheading={p?.hero_subheading}
        size="page"
      />
      <section className="section">
        <div className="container narrow">
          {p?.intro_body && <p className="lede">{p.intro_body}</p>}
          {faq.data?.map((section) => (
            <div key={section.id} className="faq-section">
              <h2 className="h3 faq-section-title">{section.title}</h2>
              <div className="faq-list">
                {section.items.map((item) => {
                  const key = `${section.id}-${item.id}`;
                  const isOpen = openItem === key;
                  return (
                    <div key={item.id} className={`faq-item ${isOpen ? "open" : ""}`}>
                      <button
                        type="button"
                        className="faq-q"
                        aria-expanded={isOpen}
                        onClick={() => setOpenItem(isOpen ? null : key)}
                      >
                        <span>{item.question}</span>
                        <span className="faq-icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
                      </button>
                      <div className="faq-a" hidden={!isOpen}>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
