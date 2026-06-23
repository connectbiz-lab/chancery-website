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
import type { Hotel, HotelSlug } from "@/lib/types";
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

function HotelContact({ h }: { h: Hotel }) {
  return (
    <article className="hotel-contact">
      <p className="eyebrow">{h.short_name}</p>
      <h2 className="h3">{h.name}</h2>
      <p className="hc-address">{h.address}</p>
      <p className="hc-phones">
        <a href={`tel:${h.phone.replace(/[\s-]+/g, "")}`}>{h.phone}</a>
        {h.phone_alt && (
          <a href={`tel:${h.phone_alt.replace(/[\s-]+/g, "")}`}>{h.phone_alt}</a>
        )}
        {h.whatsapp && (
          <a href={`https://wa.me/${h.whatsapp}`} target="_blank" rel="noopener">
            WhatsApp
          </a>
        )}
      </p>
      {(h.departments ?? []).length > 0 && (
        <ul className="hc-depts">
          {h.departments.map((d) => {
            const Icon = DEPT_ICON[d.label] ?? ContactIcon;
            return (
              <li key={d.label}>
                <span className="dept-icon"><Icon size={20} /></span>
                <div className="dept-card__body">
                  <span className="dept-name">{d.label}</span>
                  <a href={`mailto:${d.email}`}>{d.email}</a>
                  {d.phone && (
                    <a href={`tel:${d.phone.replace(/[\s-]+/g, "")}`} className="dept-phone">
                      {d.phone}
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </article>
  );
}

export function ContactPage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("contact", hotel), [hotel]);
  const hotels = useAsync(() => api.hotels(), []);

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
      setForm({ name: "", email: "", phone: "", interest: "stay", hotel_interest: hotel, message: "" });
    } catch {
      setStatus("err");
    }
  }

  if (page.loading || hotels.loading) return <Loading />;
  const p = page.data;
  const all = hotels.data ?? [];
  const current = all.find((h) => h.slug === hotel);

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Contact us"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? current?.hero_image ?? null}
        eyebrow="The Chancery Group of Hotels"
        heading="Get in touch"
        size="compact"
        footerNav={<HeroIconNav scope={hotel} />}
      />

      <section className="section contact-section">
        <div className="container">
          {/* Both properties — every number is reachable here, whichever page you came from. */}
          <div className="contacts-duo">
            {all.map((h) => <HotelContact key={h.slug} h={h} />)}
          </div>

          {/* Enquiry form — landscape, below the contacts. */}
          <div className="enquiry-band">
            <div className="enquiry-band__head">
              <p className="eyebrow">Enquiry form</p>
              <h2 className="h3">Send us a message</h2>
            </div>
            <form className="enquiry-form" onSubmit={submit}>
              <div className="enquiry-grid">
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
                <div className="field field--wide">
                  <label htmlFor="c-hotel">Property preference</label>
                  <select id="c-hotel" value={form.hotel_interest}
                    onChange={(e) => update("hotel_interest", e.target.value as HotelSlug | "either")}>
                    <option value="chancery">The Chancery Hotel — Lavelle Road</option>
                    <option value="pavilion">Chancery Pavilion — Residency Road</option>
                    <option value="either">No preference</option>
                  </select>
                </div>
                <div className="field field--full">
                  <label htmlFor="c-message">Message</label>
                  <textarea id="c-message" rows={3} value={form.message}
                    onChange={(e) => update("message", e.target.value)} />
                </div>
              </div>

              <div className="enquiry-actions">
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
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
