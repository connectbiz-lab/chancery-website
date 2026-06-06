import { useEffect, useState } from "react";
import type {
  FAQSection, GalleryImage, Hotel, HotelSlug, Offer, Page, Restaurant, Room,
  SiteContent, Testimonial, Venue,
} from "./types";

const API_BASE = "/api";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail: unknown = null;
    try { detail = await res.json(); } catch { /* ignore */ }
    throw new Error(`API ${path} → ${res.status}: ${JSON.stringify(detail)}`);
  }
  return res.json() as Promise<T>;
}

/* ---------------- typed endpoints ---------------- */

export const api = {
  siteContent: () => get<SiteContent>("/site/"),
  hotels: () => get<Hotel[]>("/hotels/"),
  hotel: (slug: HotelSlug) => get<Hotel>(`/hotels/${slug}/`),
  rooms: (hotel?: HotelSlug) =>
    get<Room[]>(hotel ? `/rooms/?hotel=${hotel}` : "/rooms/"),
  restaurants: (hotel?: HotelSlug) =>
    get<Restaurant[]>(hotel ? `/restaurants/?hotel=${hotel}` : "/restaurants/"),
  venues: (hotel?: HotelSlug) =>
    get<Venue[]>(hotel ? `/venues/?hotel=${hotel}` : "/venues/"),
  offers: (hotel?: HotelSlug) =>
    get<Offer[]>(hotel ? `/offers/?hotel=${hotel}` : "/offers/"),
  gallery: (hotel?: HotelSlug, category?: string) => {
    const params = new URLSearchParams();
    if (hotel) params.set("hotel", hotel);
    if (category) params.set("category", category);
    const q = params.toString();
    return get<GalleryImage[]>(`/gallery/${q ? `?${q}` : ""}`);
  },
  faq: () => get<FAQSection[]>("/faq/"),
  testimonials: () => get<Testimonial[]>("/testimonials/"),
  page: (kind: string, hotel?: HotelSlug) =>
    get<Page>(hotel ? `/pages/${hotel}/${kind}/` : `/pages/${kind}/`),
  submitContact: (data: Record<string, unknown>) =>
    post<{ ok: true }>("/contact/", data),
  subscribeNewsletter: (email: string) =>
    post<{ ok: true }>("/newsletter/", { email }),
};

/* ---------------- generic React hook ---------------- */

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(
  fn: () => Promise<T>,
  deps: ReadonlyArray<unknown> = [],
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((err) =>
        alive && setState({ data: null, loading: false, error: String(err) }),
      );
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
