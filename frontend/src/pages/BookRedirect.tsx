import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { PageMeta } from "@/components/PageMeta";
import { buildSynxisUrl } from "@/lib/booking";
import type { HotelSlug } from "@/lib/types";

export function BookRedirect() {
  const [params] = useSearchParams();
  const rawHotel = params.get("hotel");
  const hotel: HotelSlug = rawHotel === "chancery" ? "chancery" : "pavilion";

  useEffect(() => {
    const url = buildSynxisUrl({
      hotel,
      arrive: params.get("arrive") ?? undefined,
      depart: params.get("depart") ?? undefined,
      adult: Number(params.get("adult")) || 1,
      child: Number(params.get("child")) || 0,
      rooms: Number(params.get("rooms")) || 1,
      promo: params.get("promo") ?? undefined,
    });
    // Brief pause so the user sees the brand splash, then go.
    const t = setTimeout(() => { window.location.href = url; }, 750);
    return () => clearTimeout(t);
  }, [hotel, params]);

  return (
    <>
      <PageMeta title="Book your stay" description="Redirecting to our secure booking system…" noindex />
      <div style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "var(--c-navy)",
        color: "var(--c-ivory)",
        padding: "2rem",
        textAlign: "center",
      }}>
        <div>
          <p className="eyebrow center" style={{ color: "var(--c-gold-soft)" }}>One moment</p>
          <h1 className="h1" style={{ color: "var(--c-ivory)" }}>Booking your stay</h1>
          <p style={{ color: "rgba(246,241,231,0.85)", maxWidth: "44ch", margin: "0 auto" }}>
            Redirecting to our secure booking system at{" "}
            {hotel === "chancery" ? "The Chancery Hotel, Lavelle Road" : "The Chancery Pavilion, Residency Road"}.
          </p>
        </div>
      </div>
    </>
  );
}
