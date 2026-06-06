/* Types mirror what the Django REST endpoints return. */

export type HotelSlug = "chancery" | "pavilion";

export interface SiteContent {
  site_title: string;
  tagline: string;
  meta_description: string;
  footer_note: string;
  newsletter_heading: string;
  newsletter_description: string;
  og_image: string | null;
  instagram_url: string;
  facebook_url: string;
  tripadvisor_url: string;
  synxis_chain_id: string;
}

export interface HotelMini {
  id: number;
  slug: HotelSlug;
  name: string;
  short_name: string;
  location: string;
}

export interface Hotel extends HotelMini {
  tagline: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  rooms_count: number;
  established: string;
  location_tag: string;
  synxis_id: string;
  tripadvisor_url: string;
  tripadvisor_rating: string | null;
  tripadvisor_count: number | null;
  google_rating: string | null;
  google_count: number | null;
  hero_image: string | null;
  about_image: string | null;
  banner_image: string | null;
  logo: string | null;
  intro_heading: string;
  intro_body: string;
  order: number;
}

export interface ImageRef {
  image: string;
  alt: string;
  order: number;
}

export interface Room {
  id: number;
  hotel: HotelMini;
  name: string;
  slug: string;
  size_sqft: number | null;
  max_guests: number;
  bed_type: string;
  description: string;
  amenities: string;
  amenities_list: string[];
  hero_image: string | null;
  book_url: string;
  images: ImageRef[];
  order: number;
}

export interface Restaurant {
  id: number;
  hotel: HotelMini;
  name: string;
  slug: string;
  cuisine: string;
  timing: string;
  description: string;
  hero_image: string | null;
  logo: string | null;
  images: ImageRef[];
  order: number;
}

export interface Venue {
  id: number;
  hotel: HotelMini;
  name: string;
  slug: string;
  kind: string;
  description: string;
  area_sqft: number | null;
  dimensions: string;
  ceiling_ft: number | null;
  guests_max: number | null;
  cap_theatre: number | null;
  cap_banquet: number | null;
  cap_classroom: number | null;
  cap_ushape: number | null;
  cap_cocktail: number | null;
  half_day_inr: number | null;
  full_day_inr: number | null;
  per_plate_inr: number | null;
  hero_image: string | null;
  images: ImageRef[];
  order: number;
}

export interface Offer {
  id: number;
  tag: string;
  title: string;
  description: string;
  image: string | null;
  promo_code: string;
  min_nights: number | null;
  hotel: HotelMini | null;
  order: number;
}

export interface GalleryImage {
  id: number;
  hotel: HotelMini | null;
  category: string;
  image: string;
  alt: string;
  order: number;
}

export interface FAQItem {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export interface FAQSection {
  id: number;
  title: string;
  order: number;
  items: FAQItem[];
}

export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  title: string;
  rating: number;
  order: number;
}

export interface PageSection {
  id: number;
  kind: string;
  eyebrow: string;
  title: string;
  body: string;
  image: string | null;
  image_alt: string;
  cta_label: string;
  cta_url: string;
  order: number;
}

export interface Page {
  id: number;
  kind: string;
  hotel: HotelMini | null;
  title: string;
  meta_title: string;
  meta_description: string;
  hero_image: string | null;
  hero_eyebrow: string;
  hero_heading: string;
  hero_subheading: string;
  intro_body: string;
  sections: PageSection[];
}
