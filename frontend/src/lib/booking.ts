import type { HotelSlug } from "./types";

/**
 * SynXis Booking Engine URL construction.
 * Chain ID 18850 is shared; per-hotel synxisId is on the Hotel record.
 * Open in a new tab — never iframe SynXis (X-Frame-Options).
 */
const SYNXIS_BASE = "https://be.synxis.com/?";
const CHAIN_ID = "18850";

const SYNXIS_BY_SLUG: Record<HotelSlug, string> = {
  chancery: "67686",
  pavilion: "67687",
};

export interface BookingParams {
  hotel: HotelSlug;
  arrive?: string;     // YYYY-MM-DD
  depart?: string;     // YYYY-MM-DD
  adult?: number;
  child?: number;
  rooms?: number;
  promo?: string;
}

export function buildSynxisUrl({
  hotel, arrive, depart, adult = 1, child = 0, rooms = 1, promo,
}: BookingParams): string {
  const params = new URLSearchParams({
    chain: CHAIN_ID,
    hotel: SYNXIS_BY_SLUG[hotel],
    adult: String(adult),
    child: String(child),
    rooms: String(rooms),
  });
  if (arrive) params.set("arrive", arrive);
  if (depart) params.set("depart", depart);
  if (promo) params.set("promo", promo);
  return `${SYNXIS_BASE}${params.toString()}`;
}
