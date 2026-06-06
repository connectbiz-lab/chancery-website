import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import "./pages.css";

export function RoomsPage() {
  const page = useAsync(() => api.page("rooms"), []);
  const hotels = useAsync(() => api.hotels(), []);
  const allRooms = useAsync(() => api.rooms(), []);

  if (page.loading || allRooms.loading || hotels.loading) return <Loading />;
  const p = page.data;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Suites & Rooms"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? hotels.data?.[1]?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? "Stays"}
        heading={p?.hero_heading ?? "Rooms & suites"}
        subheading={p?.hero_subheading}
        size="page"
      />

      {hotels.data?.map((hotel) => {
        const hotelRooms = allRooms.data?.filter((r) => r.hotel.slug === hotel.slug) ?? [];
        if (hotelRooms.length === 0) return null;
        return (
          <section key={hotel.slug} className="section">
            <div className="container">
              <div className="section-head left">
                <p className="eyebrow">{hotel.location}</p>
                <h2 className="h1">{hotel.name}</h2>
                <p className="lede">{hotel.tagline}</p>
              </div>
              <div className="card-grid three">
                {hotelRooms.map((room) => (
                  <Link key={room.id} to={`/${hotel.slug}/accommodation`} className="card">
                    <div className="figure">
                      {room.hero_image && <img src={room.hero_image} alt={room.name} />}
                    </div>
                    <h3>{room.name}</h3>
                    <p className="meta">
                      {room.size_sqft ? `${room.size_sqft} sq. ft.` : ""}
                      {room.bed_type ? ` · ${room.bed_type}` : ""}
                    </p>
                    <p className="copy">{room.description.slice(0, 130)}…</p>
                  </Link>
                ))}
              </div>
              <div className="text-center" style={{ marginTop: "3rem" }}>
                <Link to={`/${hotel.slug}/accommodation`} className="btn ghost">
                  All rooms at {hotel.short_name}
                </Link>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
