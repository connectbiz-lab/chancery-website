import { useState } from "react";
import type { ComponentType } from "react";
import { Hero } from "@/components/Hero";
import { HeroIconNav } from "@/components/HeroIconNav";
import { Loading } from "@/components/Loading";
import {
  ContactIcon,
  DiningIcon,
  EventsIcon,
  HotelsIcon,
  OffersIcon,
  StayIcon,
} from "@/components/NavIcons";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import type { HotelSlug } from "@/lib/types";
import "./pages.css";
import "./ContactPage.css";

// Flat line-icon per department so the right team is easy to spot at a glance.
const DEPT_ICON: Record<string, ComponentType<{ size?: number; className?: string }>> = {
  Reservations: StayIcon,
  Sales: OffersIcon,
  "Meetings & Events": EventsIcon,
  "Outdoor Catering": DiningIcon,
  Careers: HotelsIcon,
};

interface FormState {
  name: string;
  email: string;
  phone: string;
  interest: string;
  hotel_interest: HotelSlug | "either";
  message: string;
}

export function ContactPage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("contact", hotel), [hotel]);
  const h = useAsync(() => api.hotel(hotel), [hotel]);

  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", interest: "stay",
    hotel_interest: hotel, message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "ok" | "err">("idle");

  function update<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      await api.submitContact({ ...form, page: `${hotel}/contact-us` });
      setStatus("ok");
      setForm({
        name: "", email: "", phone: "", interest: "stay",
        hotel_interest: hotel, message: "",
      });
    } catch {
      setStatus("err");
    }
  }

  if (page.loading || h.loading) return <Loading />;
  const p = page.data;
  const hotelData = h.data!;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Contact us"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? hotelData.hero_image}
        eyebrow={
          <span className="hero-eyebrow-stack">
            <span>{hotelData.name}</span>
            <span>{p?.hero_eyebrow ?? "Contact"}</span>
          </span>
        }
        heading={p?.hero_heading ?? "Contact us"}
        subheading={p?.hero_subheading}
        size="compact"
        footerNav={<HeroIconNav scope={hotel} />}
      />
      <section className="section contact-section">
        <div className="container">
          <div className="contact-grid">
            <aside className="contact-info">
              <p className="eyebrow">{hotelData.short_name}</p>
              <h2 className="h2">Direct lines</h2>
              <div className="contact-list">
                <div>
                  <span className="label">Address</span>
                  <p>{hotelData.address}</p>
                </div>
                <div>
                  <span className="label">Phone</span>
                  <p><a href={`tel:${hotelData.phone.replace(/\s+/g, "")}`}>{hotelData.phone}</a></p>
                  {hotelData.phone_alt && (
                    <p><a href={`tel:${hotelData.phone_alt.replace(/[\s-]+/g, "")}`}>{hotelData.phone_alt}</a></p>
                  )}
                </div>
                {hotelData.fax && (
                  <div>
                    <span className="label">Fax</span>
                    <p>{hotelData.fax}</p>
                  </div>
                )}
                {hotelData.whatsapp && (
                  <div>
                    <span className="label">WhatsApp</span>
                    <p>
                      <a href={`https://wa.me/${hotelData.whatsapp}`} target="_blank" rel="noopener">
                        Open chat
                      </a>
                    </p>
                  </div>
                )}
              </div>
            </aside>

            <form className="contact-form" onSubmit={submit}>
              <p className="eyebrow">Enquiry form</p>
              <h2 className="h2">Send us a message</h2>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="c-name">Full name</label>
                  <input id="c-name" type="text" required value={form.name}
                    onChange={(e) => update("name", e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" type="email" required value={form.email}
                    onChange={(e) => update("email", e.target.value)} />
                </div>
              </div>

              <div className="field-row">
                <div className="field">
                  <label htmlFor="c-phone">Phone (optional)</label>
                  <input id="c-phone" type="tel" value={form.phone}
                    onChange={(e) => update("phone", e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="c-interest">I'm interested in</label>
                  <select id="c-interest" value={form.interest}
                    onChange={(e) => update("interest", e.target.value)}>
                    <option value="stay">A stay / room booking</option>
                    <option value="dining">Dining reservation</option>
                    <option value="event">An event or wedding</option>
                    <option value="catering">Outdoor catering</option>
                    <option value="careers">Careers</option>
                    <option value="other">Something else</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label htmlFor="c-hotel">Property preference</label>
                <select id="c-hotel" value={form.hotel_interest}
                  onChange={(e) => update("hotel_interest", e.target.value as HotelSlug | "either")}>
                  <option value="chancery">The Chancery Hotel — Lavelle Road</option>
                  <option value="pavilion">Chancery Pavilion — Residency Road</option>
                  <option value="either">No preference</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="c-message">Message</label>
                <textarea id="c-message" rows={5} value={form.message}
                  onChange={(e) => update("message", e.target.value)} />
              </div>

              {status === "ok" && (
                <p className="form-status ok" role="status">
                  Thank you. Our team will be in touch shortly.
                </p>
              )}
              {status === "err" && (
                <p className="form-status err" role="alert">
                  Something went wrong. Please try again or call us directly.
                </p>
              )}

              <button type="submit" className="btn" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send enquiry"}
              </button>
            </form>
          </div>

          {(hotelData.departments ?? []).length > 0 && (
            <div className="dept-band">
              <div className="dept-band__head">
                <p className="eyebrow">Departments</p>
                <h2 className="h3">Reach the right team</h2>
              </div>
              <div className="dept-grid">
                {hotelData.departments.map((d) => {
                  const Icon = DEPT_ICON[d.label] ?? ContactIcon;
                  return (
                    <div className="dept-card" key={d.label}>
                      <span className="dept-icon"><Icon size={22} /></span>
                      <div className="dept-card__body">
                        <span className="dept-name">{d.label}</span>
                        <a href={`mailto:${d.email}`}>{d.email}</a>
                        {d.phone && (
                          <a href={`tel:${d.phone.replace(/[\s-]+/g, "")}`} className="dept-phone">
                            {d.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
