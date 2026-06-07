import { useState } from "react";
import { Link } from "react-router-dom";
import { BookButton } from "@/components/BookButton";
import { Hero } from "@/components/Hero";
import { HeroIconNav } from "@/components/HeroIconNav";
import { Loading } from "@/components/Loading";
import { PageMeta } from "@/components/PageMeta";
import { api, useAsync } from "@/lib/api";
import type { HotelSlug, Room } from "@/lib/types";
import "./pages.css";
import "./AccommodationPage.css";

export function AccommodationPage({ hotel }: { hotel: HotelSlug }) {
  const page = useAsync(() => api.page("accommodation", hotel), [hotel]);
  const h = useAsync(() => api.hotel(hotel), [hotel]);
  const rooms = useAsync(() => api.rooms(hotel), [hotel]);

  if (page.loading || rooms.loading || h.loading) return <Loading />;
  const p = page.data;

  return (
    <>
      <PageMeta title={p?.meta_title ?? "Rooms"} description={p?.meta_description} />
      <Hero
        image={p?.hero_image ?? h.data?.hero_image ?? null}
        eyebrow={p?.hero_eyebrow ?? h.data?.name}
        heading={p?.hero_heading ?? "Rooms & suites"}
        subheading={p?.hero_subheading}
        size="page"
        footerNav={<HeroIconNav scope={hotel} />}
      />
      <section className="section">
        <div className="container">
          {p?.intro_body && (
            <div className="section-head">
              <p className="lede">{p.intro_body}</p>
            </div>
          )}
          <div className="rooms-list">
            {rooms.data?.map((room, idx) => (
              <RoomBlock key={room.id} room={room} flip={idx % 2 === 1} hotel={hotel} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function RoomBlock({ room, flip, hotel }: { room: Room; flip: boolean; hotel: HotelSlug }) {
  const [active, setActive] = useState(0);
  const images = room.images.length > 0
    ? room.images
    : (room.hero_image ? [{ image: room.hero_image, alt: room.name, order: 0 }] : []);

  return (
    <article className={`room-row ${flip ? "flip" : ""}`}>
      <div className="room-gallery">
        <div className="figure aspect-43">
          {images[active] && <img src={images[active].image} alt={images[active].alt || room.name} />}
        </div>
        {images.length > 1 && (
          <div className="thumbs">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                className={`thumb ${i === active ? "active" : ""}`}
                onClick={() => setActive(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={img.image} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="room-text">
        <p className="eyebrow">{room.size_sqft ? `${room.size_sqft} sq. ft.` : "Room"}</p>
        <h2 className="h2">{room.name}</h2>
        <p className="meta">
          {room.bed_type && <span>{room.bed_type}</span>}
          {room.max_guests > 0 && <span>· {room.max_guests} guests</span>}
        </p>
        <p className="copy">{room.description}</p>
        {room.amenities_list.length > 0 && (
          <ul className="amenities">
            {room.amenities_list.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        )}
        <div className="room-cta">
          <BookButton hotel={hotel} className="btn">Book this room</BookButton>
        </div>
      </div>
    </article>
  );
}
