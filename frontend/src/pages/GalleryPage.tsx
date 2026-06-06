import { useMemo, useState } from "react";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import type { HotelSlug } from "@/lib/types";
import "./pages.css";
import "./GalleryPage.css";

const LABELS: Record<string, string> = {
  hotel: "Hotel", lobby: "Lobby", rooms: "Rooms", dining: "Dining", events: "Events",
};

export function GalleryPage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("gallery", hotel), [hotel]);
  const h = useAsync(() => api.hotel(hotel), [hotel]);
  const gallery = useAsync(() => api.gallery(hotel), [hotel]);
  const [filter, setFilter] = useState<string>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    gallery.data?.forEach((g) => set.add(g.category));
    return ["all", ...Array.from(set)];
  }, [gallery.data]);

  const filtered = useMemo(
    () => (gallery.data ?? []).filter((g) => filter === "all" || g.category === filter),
    [gallery.data, filter],
  );

  if (page.loading || gallery.loading || h.loading) return <Loading />;
  const p = page.data;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Gallery"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? h.data?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow}
        heading={p?.hero_heading ?? "Gallery"}
        subheading={p?.hero_subheading}
        size="page"
      />
      <section className="section">
        <div className="container">
          <div className="gallery-filters">
            {categories.map((c) => (
              <button
                key={c}
                type="button"
                className={`gallery-tab ${filter === c ? "active" : ""}`}
                onClick={() => setFilter(c)}
              >
                {c === "all" ? "All" : LABELS[c] ?? c}
              </button>
            ))}
          </div>
          <div className="gallery-grid">
            {filtered.map((g, i) => (
              <button
                key={g.id}
                type="button"
                className="gallery-item figure"
                onClick={() => setLightbox(i)}
                aria-label={g.alt}
              >
                <img src={g.image} alt={g.alt} loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {lightbox != null && filtered[lightbox] && (
        <div
          role="dialog"
          aria-modal="true"
          className="lightbox"
          onClick={() => setLightbox(null)}
        >
          <img src={filtered[lightbox].image} alt={filtered[lightbox].alt} />
          <p className="lightbox-caption">{filtered[lightbox].alt}</p>
          <button
            type="button"
            className="lightbox-close"
            aria-label="Close"
            onClick={(e) => { e.stopPropagation(); setLightbox(null); }}
          >×</button>
          {lightbox > 0 && (
            <button
              type="button"
              className="lightbox-prev"
              aria-label="Previous"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox - 1); }}
            >‹</button>
          )}
          {lightbox < filtered.length - 1 && (
            <button
              type="button"
              className="lightbox-next"
              aria-label="Next"
              onClick={(e) => { e.stopPropagation(); setLightbox(lightbox + 1); }}
            >›</button>
          )}
        </div>
      )}
    </>
  );
}
