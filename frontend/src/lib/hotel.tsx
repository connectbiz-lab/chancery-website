import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import type { HotelSlug } from "./types";

const HOTELS: HotelSlug[] = ["pavilion", "chancery"];

function hotelFromPath(pathname: string): HotelSlug | null {
  const seg = pathname.split("/").filter(Boolean)[0];
  return (HOTELS as string[]).includes(seg) ? (seg as HotelSlug) : null;
}

interface HotelCtx {
  /** The active hotel scope, derived from URL. null on brand-level pages. */
  active: HotelSlug | null;
  /** Whichever hotel was most recently active, defaulting to pavilion. */
  fallback: HotelSlug;
}

const Ctx = createContext<HotelCtx>({ active: null, fallback: "pavilion" });

export function HotelProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const active = useMemo(() => hotelFromPath(pathname), [pathname]);
  const [fallback, setFallback] = useState<HotelSlug>(active ?? "pavilion");

  useEffect(() => {
    if (active) setFallback(active);
  }, [active]);

  const value = useMemo(() => ({ active, fallback }), [active, fallback]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useHotel() {
  return useContext(Ctx);
}
