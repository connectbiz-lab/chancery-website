import { useEffect, useState } from "react";
import type {
  FAQSection, GalleryImage, Hotel, HotelSlug, Offer, Page, Restaurant, Room,
  SiteContent, Testimonial, Venue,
} from "./types";

// Dev: Vite proxies "/api" to Django. Prod: "/api" is reserved by Vercel for
// Serverless Functions, so we proxy the backend under "/proxy-api" via vercel.json.
const API_BASE = import.meta.env.PROD ? "/proxy-api" : "/api";

// DRF returns absolute image URLs built from the backend host
// (e.g. http://3.111.60.193/media/... or http://127.0.0.1:8000/media/...).
// Strip the host so URLs become same-origin relative: in dev the Vite proxy
// forwards /media + /api, and in prod the Vercel rewrites do — which also keeps
// the (http) backend off an https page, avoiding mixed-content blocking.
const BACKEND_HOST = /https?:\/\/(?:3\.111\.60\.193|127\.0\.0\.1:8000|localhost:8000)/g;

function relativizeHosts(json: string): string {
  return json.replace(BACKEND_HOST, "");
}

// Session cache: dedupe in-flight requests and serve repeat navigations
// instantly, so we don't re-show the full-page "Loading…" and wait on a fresh
// round-trip every time. The data is read-only marketing content — safe to keep
// for the page session (cleared on a full reload). Caching the promise (not just
// the value) also dedupes concurrent identical calls.
const cache = new Map<string, Promise<unknown>>();

function get<T>(path: string): Promise<T> {
  let req = cache.get(path);
  if (!req) {
    req = fetch(`${API_BASE}${path}`, { headers: { Accept: "application/json" } })
      .then(async (res) => {
        if (!res.ok) throw new Error(`API ${path} → ${res.status}`);
        return JSON.parse(relativizeHosts(await res.text()));
      });
    req.catch(() => cache.delete(path)); // never cache a failure
    cache.set(path, req);
  }
  return req as Promise<T>;
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
