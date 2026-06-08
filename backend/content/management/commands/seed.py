"""
Seed the database with Chancery Hotels content.

- COPIES (never moves) images from ../../chancery-website/public/images/
  into MEDIA_ROOT/seed/, then attaches them to records via ImageField.
- Creates Hotel, RoomCategory + images, Restaurant + images,
  Venue + images, Offer, GalleryImage, FAQ, Testimonial, SiteContent,
  and Page rows.
- Idempotent: re-runs replace all content (delete-then-create).

Usage:
    python manage.py seed
    python manage.py seed --source-root /custom/path/to/chancery-website
"""

import shutil
from pathlib import Path

from django.conf import settings
from django.core.files import File
from django.core.management.base import BaseCommand
from django.db import transaction

from content.models import (
    FAQItem,
    FAQSection,
    GalleryImage,
    Hotel,
    Offer,
    Page,
    PageSection,
    Restaurant,
    RestaurantImage,
    RoomCategory,
    RoomImage,
    SiteContent,
    Testimonial,
    Venue,
    VenueImage,
)


DEFAULT_SOURCE = Path("/Users/jagraj/Documents/Github/chancery-website")

# v2-local "frozen" assets: photography that lives inside this repo so the
# seed no longer depends on the legacy v1 source for it. Prefer this over
# img_path() when a curated v2 replacement exists.
LOCAL_ASSETS = Path(__file__).resolve().parents[3] / "seed_assets"


def img_path(source_root: Path, rel: str) -> Path | None:
    """Resolve a /images/... path from the old site into an absolute source path."""
    rel = rel.lstrip("/")
    candidate = source_root / "public" / rel
    return candidate if candidate.exists() else None


def local_path(rel: str) -> Path | None:
    """Resolve a path inside backend/seed_assets/ (v2-owned photography)."""
    candidate = LOCAL_ASSETS / rel.lstrip("/")
    return candidate if candidate.is_file() else None


def seed_image(source_root: Path, rel: str) -> Path | None:
    """Prefer a v2-local frozen asset, otherwise fall back to the v1 source.
    Lets a single canonical path (e.g. /images/pavilion/hero.jpg) silently
    upgrade to the curated v2 copy when one exists under seed_assets/."""
    local_rel = rel.lstrip("/").removeprefix("images/")
    return local_path(local_rel) or img_path(source_root, rel)


def attach(model_instance, field_name: str, src_path: Path, save: bool = True):
    """Copy a source image into MEDIA_ROOT via the model's ImageField."""
    if not src_path or not src_path.exists():
        return False
    with open(src_path, "rb") as fh:
        getattr(model_instance, field_name).save(src_path.name, File(fh), save=save)
    return True


class Command(BaseCommand):
    help = "Seed the Chancery Hotels database with starter content."

    def add_arguments(self, parser):
        parser.add_argument(
            "--source-root",
            type=str,
            default=str(DEFAULT_SOURCE),
            help="Path to the legacy chancery-website repo for image sourcing.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        source = Path(options["source_root"])
        if not source.exists():
            self.stderr.write(self.style.ERROR(f"Source not found: {source}"))
            return

        self.stdout.write(self.style.NOTICE(f"Sourcing images from {source}"))
        self._wipe()
        self._site_content(source)
        chancery, pavilion = self._hotels(source)
        self._rooms(source, chancery, pavilion)
        self._restaurants(source, chancery, pavilion)
        self._venues(source, chancery, pavilion)
        self._offers(source, chancery, pavilion)
        self._gallery(source, chancery, pavilion)
        self._faq()
        self._testimonials()
        self._pages(source, chancery, pavilion)
        self.stdout.write(self.style.SUCCESS("Seed complete."))

    # ------------------------------------------------------------------ wipe
    def _wipe(self):
        self.stdout.write("Wiping content tables…")
        Page.objects.all().delete()
        FAQSection.objects.all().delete()
        Testimonial.objects.all().delete()
        GalleryImage.objects.all().delete()
        Offer.objects.all().delete()
        Venue.objects.all().delete()
        Restaurant.objects.all().delete()
        RoomCategory.objects.all().delete()
        Hotel.objects.all().delete()
        SiteContent.objects.all().delete()
        # Optionally clear the media/seed/ folder if it exists.
        media_seed = Path(settings.MEDIA_ROOT)
        if media_seed.exists():
            for sub in ("hotels", "rooms", "dining", "venues", "offers", "gallery", "brand", "pages"):
                p = media_seed / sub
                if p.exists():
                    shutil.rmtree(p, ignore_errors=True)

    # --------------------------------------------------------- site content
    def _site_content(self, source):
        sc, _ = SiteContent.objects.get_or_create(pk=1)
        sc.site_title = "Chancery Hotels"
        sc.tagline = "Luxury Hotels in Bangalore"
        sc.meta_description = (
            "The Chancery Group of Hotels: Premium luxury hotels in Bangalore "
            "offering world-class rooms, fine dining, event venues & exclusive "
            "packages."
        )
        sc.footer_note = (
            "The Chancery Group of Hotels — two distinguished properties in "
            "Bangalore offering timeless hospitality, refined dining and "
            "thoughtfully crafted experiences."
        )
        sc.newsletter_heading = "Stay in touch"
        sc.newsletter_description = (
            "Receive periodic updates on new offers, dining experiences and "
            "events from The Chancery Group of Hotels."
        )
        sc.instagram_url = "https://www.instagram.com/chanceryhotels/"
        sc.facebook_url = "https://www.facebook.com/share/1Dxmnc3Mez/"
        sc.synxis_chain_id = "18850"
        sc.save()

        og = img_path(source, "/images/common/chancery-banner.jpg")
        if og:
            attach(sc, "og_image", og)
        brand_logo = img_path(source, "/images/common/Chancery.png")
        if brand_logo:
            attach(sc, "brand_logo", brand_logo)
        self.stdout.write("  · site content")

    # ----------------------------------------------------------------- hotels
    def _hotels(self, source):
        chancery = Hotel.objects.create(
            slug="chancery",
            name="The Chancery Hotel",
            short_name="Chancery Hotel",
            tagline="Timeless Elegance on Lavelle Road",
            location="Lavelle Road",
            address="10/6, Lavelle Road, Bangalore 560 001",
            phone="+91 80 2227 6767",
            whatsapp="918022276767",
            email="reservations.tch@chanceryhotels.com",
            rooms_count=126,
            established="1968",
            location_tag="Heritage",
            synxis_id="67686",
            tripadvisor_url=(
                "https://www.tripadvisor.com.au/Hotel_Review-g297628-d496589-"
                "Reviews-The_Chancery-Bengaluru_Bangalore_District_Karnataka.html"
            ),
            tripadvisor_rating="4.5",
            tripadvisor_count=1800,
            google_rating="4.4",
            google_count=3200,
            intro_heading="Timeless elegance on Lavelle Road",
            intro_body=(
                "The Chancery is a 4-star corporate city-centre hotel with 25 "
                "years of excellence in the hospitality sector. 126 spacious, "
                "well-appointed rooms and suites; 6,800 sq ft of banqueting "
                "space; and a joint venture with Toyota Enterprises that "
                "brings authentic Japanese hospitality on-site — Matsuri "
                "(renowned Japanese specialty restaurant) and Sara Spa with "
                "Sento services. Strategically located on Lavelle Road with "
                "access to the city's corporate houses, shopping malls and "
                "entertainment centres."
            ),
            order=2,
        )
        attach(chancery, "hero_image", seed_image(source, "/images/chancery/hero.jpg"))
        attach(chancery, "about_image", img_path(source, "/images/chancery/about.jpg"))
        attach(chancery, "banner_image", img_path(source, "/images/common/chancery-banner.jpg"))
        attach(chancery, "logo", img_path(source, "/images/common/TCH.png"))

        pavilion = Hotel.objects.create(
            slug="pavilion",
            name="The Chancery Pavilion",
            short_name="Chancery Pavilion",
            tagline="Contemporary Luxury on Residency Road",
            location="Residency Road",
            address="#135, Residency Road, Bangalore 560 025",
            phone="+91 80 4141 4141",
            whatsapp="918041414141",
            email="reservations.tcp@chanceryhotels.com",
            rooms_count=223,
            established="2000",
            location_tag="Flagship",
            synxis_id="67687",
            tripadvisor_url=(
                "https://www.tripadvisor.com.au/Hotel_Review-g297628-d596442-"
                "Reviews-The_Chancery_Pavilion-Bengaluru_Bangalore_District_Karnataka.html"
            ),
            tripadvisor_rating="4.5",
            tripadvisor_count=1800,
            google_rating="4.4",
            google_count=3200,
            intro_heading="Contemporary luxury on Residency Road",
            intro_body=(
                "The Chancery Pavilion is the flagship of the Chancery group — "
                "19 years of opulent hospitality, with 223 tastefully designed "
                "rooms and suites rising above Residency Road. 20,000 sq ft of "
                "banqueting space, an entire floor dedicated to lady "
                "travellers, Alchemy (the award-winning rooftop restaurant "
                "and microbrewery), Ithaca's 24/7 coffee shop overlooking the "
                "pool, and a glittering lobby anchored by a well-equipped "
                "gymnasium and outdoor swimming pool."
            ),
            order=1,
        )
        attach(pavilion, "hero_image", seed_image(source, "/images/pavilion/hero.jpg"))
        attach(pavilion, "about_image", img_path(source, "/images/pavilion/about.jpg"))
        attach(pavilion, "banner_image", img_path(source, "/images/common/pavilion-banner.jpg"))
        attach(pavilion, "logo", img_path(source, "/images/common/TCP_LOGO.png"))

        self.stdout.write("  · hotels (Chancery, Pavilion)")
        return chancery, pavilion

    # ------------------------------------------------------------------ rooms
    def _rooms(self, source, chancery, pavilion):
        pavilion_rooms = [
            {
                "name": "Superior Room",
                "size_sqft": 340,
                "max_guests": 2,
                "bed_type": "King / Twin",
                "description": (
                    "Elegantly furnished with everything you need. Enjoy a "
                    "delicious breakfast at our all-day dining restaurant Ithaca."
                ),
                "amenities": "Free Wi-Fi\nMini Bar\nLCD TV\nRain Shower",
                "images": [
                    "/images/pavilion/superior-room-bed.jpg",
                    "/images/pavilion/superior-room-lounge.jpg",
                ],
            },
            {
                "name": "Deluxe Room",
                "size_sqft": 354,
                "max_guests": 2,
                "bed_type": "King",
                "description": (
                    "Plush interiors coupled with chic upholstery and modern "
                    "amenities. Non-smoking rooms with cable TV and city views."
                ),
                "amenities": "Free Wi-Fi\nMini Bar\nWork Desk\nCity View\nBathrobes",
                "images": [
                    "/images/pavilion/deluxe-room-lounge.jpg",
                    "/images/pavilion/deluxe-room-bed.jpg",
                ],
            },
            {
                "name": "Club Pavilion",
                "size_sqft": 354,
                "max_guests": 2,
                "bed_type": "King",
                "description": (
                    "Located on the top floors with separate shower area and "
                    "bath tub. An array of premium amenities for a seamless stay."
                ),
                "amenities": (
                    "Lounge Access\nFree Wi-Fi\nEvening Canapes\n"
                    "Premium Minibar\nButler Service"
                ),
                "images": [
                    "/images/pavilion/club-pavilion-bed.jpg",
                    "/images/pavilion/club-pavilion-lounge.jpg",
                ],
            },
            {
                "name": "Executive Suite",
                "size_sqft": 690,
                "max_guests": 3,
                "bed_type": "King",
                "description": (
                    "Includes a living room with dining facilities, powder "
                    "room, four-fixture bathrooms and express check-in/out."
                ),
                "amenities": (
                    "Separate Living\nLounge Access\nWhirlpool Bath\n"
                    "Butler Service\nAirport Transfer"
                ),
                "images": [
                    "/images/pavilion/executive-suite-bed.jpg",
                    "/images/pavilion/executive-suite-living.jpg",
                ],
            },
            {
                "name": "Presidential Suite",
                "size_sqft": 1200,
                "max_guests": 4,
                "bed_type": "King",
                "description": (
                    "The pinnacle of luxury with expansive living spaces, "
                    "private dining, panoramic city views, premium bar and "
                    "personalised butler service."
                ),
                "amenities": (
                    "Grand Living Room\nDining Area\nJacuzzi\n"
                    "Dedicated Butler\nAirport Transfer\nPremium Minibar"
                ),
                "images": [
                    "/images/pavilion/presidential-suite-bed.jpg",
                    "/images/pavilion/presidential-suite-living.jpg",
                ],
            },
        ]
        chancery_rooms = [
            {
                "name": "Deluxe Room",
                "size_sqft": 280,
                "max_guests": 2,
                "bed_type": "King / Twin",
                "description": (
                    "A refreshing retreat away from the city's hustle and "
                    "bustle. Suitable for all kinds of guests with varied "
                    "requirements."
                ),
                "amenities": (
                    "Free Wi-Fi\nMini Bar\nFlat Screen TV\nTea & Coffee Maker"
                ),
                "images": [
                    "/images/chancery/deluxe-room-bed.jpg",
                    "/images/chancery/deluxe-room-king.jpg",
                ],
            },
            {
                "name": "Premium Room",
                "size_sqft": 320,
                "max_guests": 2,
                "bed_type": "King",
                "description": (
                    "Elegantly bedecked with regal interiors, exquisitely "
                    "designed with all the amenities for modern-day travellers."
                ),
                "amenities": (
                    "Free Wi-Fi\nMini Bar\nWork Desk\nCity View\n"
                    "Bathrobe & Slippers"
                ),
                "images": [
                    "/images/chancery/premium-room-bed.jpg",
                    "/images/chancery/premium-room-workspace.jpg",
                ],
            },
        ]

        def make(hotel, items, book_param):
            for idx, item in enumerate(items, start=1):
                room = RoomCategory.objects.create(
                    hotel=hotel,
                    name=item["name"],
                    size_sqft=item["size_sqft"],
                    max_guests=item["max_guests"],
                    bed_type=item["bed_type"],
                    description=item["description"],
                    amenities=item["amenities"],
                    book_url=f"/book?hotel={book_param}",
                    order=idx,
                )
                if item["images"]:
                    attach(room, "hero_image", img_path(source, item["images"][0]))
                for j, rel in enumerate(item["images"]):
                    p = img_path(source, rel)
                    if not p:
                        continue
                    ri = RoomImage(room=room, alt=item["name"], order=j)
                    attach(ri, "image", p)

        make(pavilion, pavilion_rooms, "pavilion")
        make(chancery, chancery_rooms, "chancery")
        self.stdout.write(f"  · room categories ({RoomCategory.objects.count()})")

    # ------------------------------------------------------------ restaurants
    def _restaurants(self, source, chancery, pavilion):
        items = [
            ("chancery", {
                "name": "Matsuri",
                "cuisine": "Japanese",
                "timing": "12:00 – 15:00 & 18:00 – 23:00",
                "description": (
                    "A culinary quest to the mystical land of Japan, helmed by "
                    "Executive Chef Masayoshi Okada. With 30 years of experience "
                    "in Japanese cuisine gained overseas, Chef Okada blends "
                    "local ingredients with authentic Sushi, Tempura, Sashimi "
                    "and Hiyayakko — a celebration of Japanese culture in "
                    "every dish."
                ),
                "hero": "/images/chancery/matsuri-team.jpg",
                "images": [
                    "/images/chancery/matsuri-team.jpg",
                    "/images/chancery/matsuri-dining.jpg",
                    "/images/chancery/matsuri-private.jpg",
                ],
                "logo": "/images/common/matsuri-logo.svg",
            }),
            ("chancery", {
                "name": "South Parade",
                "cuisine": "Multi-Cuisine",
                "timing": "All-Day Dining",
                "description": (
                    "From fresh Greek salad to Chicken Wanton, Minestrone "
                    "Soup and Aubergine Piccata. Enjoy buffet breakfast, "
                    "lunch and dinner with international flavours."
                ),
                "hero": "/images/chancery/south-parade-dining.jpg",
                "images": [
                    "/images/chancery/south-parade-dining.jpg",
                    "/images/chancery/south-parade-buffet.jpg",
                    "/images/chancery/south-parade-lobby.jpg",
                ],
                "logo": "/images/common/south-parade-logo.svg",
            }),
            ("pavilion", {
                "name": "Alchemy",
                "cuisine": "Modern Indian",
                "timing": "12:00 PM – 12:30 AM",
                "description": (
                    "Award-winning rooftop restaurant and microbrewery with "
                    "panoramic views of Bengaluru — menu curated by celebrity "
                    "Chef Hari Nayak with progressive Indian cuisine, and craft "
                    "beers brewed in association with Cavalier Australia. "
                    "Seasonal and specialty brews on tap, with a confluence of "
                    "rich Indian authentic flavours."
                ),
                "hero": "/images/pavilion/alchemy-rooftop-sunset.jpg",
                "images": [
                    "/images/pavilion/alchemy-rooftop-sunset.jpg",
                    "/images/pavilion/alchemy-night.jpg",
                    "/images/pavilion/alchemy-bar-interior.jpg",
                    "/images/pavilion/alchemy-food.jpg",
                    "/images/pavilion/alchemy-branding.jpg",
                ],
                "logo": "/images/common/alchemy-logo.svg",
            }),
            ("pavilion", {
                "name": "Ithaca",
                "cuisine": "Multi-Cuisine",
                "timing": "All-Day Dining",
                "description": (
                    "A melting pot of global flavours. Choose from a lavish "
                    "buffet or an à la carte menu — the one-stop destination "
                    "for worldly delicacies from around the globe."
                ),
                "hero": "/images/pavilion/ithaca-dining.jpg",
                "images": [
                    "/images/pavilion/ithaca-dining.jpg",
                    "/images/pavilion/ithaca-pool-view.jpg",
                    "/images/pavilion/ithaca-buffet-hall.jpg",
                    "/images/pavilion/ithaca-buffet-salads.jpg",
                ],
                "logo": "/images/common/ithaca-logo.svg",
            }),
            ("pavilion", {
                "name": "The Lounge",
                "cuisine": "Multi-Cuisine",
                "timing": "09:00 – 22:30",
                "description": (
                    "The ideal place to let your hair down — an opulent "
                    "setting for business discussions or fun conversations "
                    "with fine wine, mocktails and short eats."
                ),
                "hero": "/images/pavilion/lounge-main.jpg",
                "images": [
                    "/images/pavilion/lounge-main.jpg",
                    "/images/pavilion/lounge-bar-view.jpg",
                    "/images/pavilion/lounge-bar.jpg",
                ],
                "logo": "/images/common/lounge-logo.svg",
            }),
        ]
        for idx, (hotel_slug, item) in enumerate(items, start=1):
            hotel = chancery if hotel_slug == "chancery" else pavilion
            r = Restaurant.objects.create(
                hotel=hotel,
                name=item["name"],
                cuisine=item["cuisine"],
                timing=item["timing"],
                description=item["description"],
                order=idx,
            )
            attach(r, "hero_image", img_path(source, item["hero"]))
            attach(r, "logo", img_path(source, item["logo"]))
            for j, rel in enumerate(item["images"]):
                p = img_path(source, rel)
                if not p:
                    continue
                ri = RestaurantImage(restaurant=r, alt=item["name"], order=j)
                attach(ri, "image", p)
        self.stdout.write(f"  · restaurants ({Restaurant.objects.count()})")

    # ----------------------------------------------------------------- venues
    def _venues(self, source, chancery, pavilion):
        # (hotel_slug, name, kind, area_sqft, dims, ceiling, guests_max,
        #  cap_t, cap_b, cap_c, cap_u, cap_cock,
        #  half_day, full_day, per_plate, description, hero_rel, gallery_rels)
        items = [
            ("pavilion", "The Grand Ball Room", "ballroom", 5088, "96 × 53 ft", 22, 650,
             650, 420, 280, 120, 700, 250000, 450000, 2400,
             "From large-scale dream weddings to extravagant parties and "
             "high-profile corporate events. The crown jewel of Chancery's event spaces.",
             "/images/pavilion/grand-ballroom-conference.jpg",
             ["/images/pavilion/grand-ballroom-conference.jpg",
              "/images/pavilion/grand-ballroom-banquet.jpg",
              "/images/pavilion/grand-ballroom-theatre.jpg"]),
            ("pavilion", "Sigma", "conference", 676, "40 × 17 ft", 11, 72,
             72, 48, 40, 28, None, 45000, 75000, 1800,
             "A versatile space divisible into 3 halls — perfect for boardroom "
             "meetings, intimate conferences and exclusive corporate presentations.",
             None, []),
            ("pavilion", "Esquire", "divisible", 1134, "54 × 21 ft", 11, 180,
             180, 120, 100, 54, None, 65000, 110000, 1900,
             "Divisible into 2 elegantly appointed halls — ideal for mid-size "
             "corporate events, seminars and product launches.",
             None, []),
            ("pavilion", "Indian Affair", "banquet", 2840, "71 × 40 ft", 14, 300,
             300, 200, 140, 80, None, 140000, 240000, 2100,
             "A grand setting for receptions, cocktail parties and gala dinners "
             "with state-of-the-art audio-visual equipment.",
             None, []),
            ("pavilion", "Poolside Banqueting", "al_fresco", 3200, "80 × 40 ft", None, 220,
             None, 160, None, None, 220, 175000, 295000, 2500,
             "The perfect al fresco site for private dinners, cocktail soirées, "
             "bachelor parties and themed celebrations under the stars.",
             None, []),
            ("pavilion", "Pavilion Board Room", "executive", 420, "28 × 15 ft", 10, 16,
             None, None, None, 16, None, 25000, 40000, None,
             "An intimate executive setting for high-level discussions, board "
             "meetings and strategic planning sessions.",
             None, []),
            ("chancery", "The Lavelle Hall", "banquet", 2400, "60 × 40 ft", 14, 250,
             250, 180, 120, 70, None, 110000, 195000, 2000,
             "An elegant pillarless banquet hall on Lavelle Road — ideal for "
             "weddings, receptions and milestone celebrations with classic styling.",
             None, []),
            ("chancery", "The Heritage Room", "private_dining", 950, "38 × 25 ft", 12, 80,
             80, 60, 40, 28, None, 55000, 90000, 1800,
             "A refined private dining and meeting room with colonial-era "
             "charm — perfect for intimate ceremonies and corporate luncheons.",
             None, []),
            ("chancery", "Chancery Boardroom", "executive", 450, "30 × 15 ft", 10, 20,
             None, None, None, 20, None, 28000, 45000, None,
             "A discreet executive boardroom for senior leadership meetings "
             "and confidential strategy sessions on Lavelle Road.",
             None, []),
            ("chancery", "Garden Terrace", "al_fresco", 1800, "60 × 30 ft", None, 150,
             None, 100, None, None, 150, 95000, 165000, 2200,
             "An open-air terrace surrounded by greenery — perfect for "
             "cocktail receptions, mehendi ceremonies and themed evenings.",
             None, []),
        ]
        for idx, row in enumerate(items, start=1):
            (hslug, name, kind, area_sqft, dims, ceiling, gmax,
             ct, cb, cc, cu, ccoc, half, full, plate, desc, hero_rel, gallery_rels) = row
            hotel = chancery if hslug == "chancery" else pavilion
            v = Venue.objects.create(
                hotel=hotel,
                name=name,
                kind=kind,
                description=desc,
                area_sqft=area_sqft,
                dimensions=dims,
                ceiling_ft=ceiling,
                guests_max=gmax,
                cap_theatre=ct, cap_banquet=cb, cap_classroom=cc, cap_ushape=cu, cap_cocktail=ccoc,
                half_day_inr=half, full_day_inr=full, per_plate_inr=plate,
                order=idx,
            )
            if hero_rel:
                attach(v, "hero_image", img_path(source, hero_rel))
            for j, rel in enumerate(gallery_rels):
                p = img_path(source, rel)
                if not p:
                    continue
                vi = VenueImage(venue=v, alt=name, order=j)
                attach(vi, "image", p)
        self.stdout.write(f"  · venues ({Venue.objects.count()})")

    # ----------------------------------------------------------------- offers
    def _offers(self, source, chancery, pavilion):
        # Placeholder images sourced from the legacy gallery — easy to swap
        # out from /admin once final offer photography is ready.
        items = [
            (None, "Save 15%", "Early Bird Offer",
             "Book 21 days in advance and enjoy 15% off the best available "
             "rate. Book 7 days ahead for 10% off.",
             "EARLYBIRD", None, "/images/chancery/lobby.jpg"),
            (None, "Min 7 Nights", "Extended Stay Package",
             "Stay for a minimum of 7 nights and enjoy special discounted "
             "rates across all room categories.",
             "EXTENDED7", 7, "/images/pavilion/superior-room-lounge.jpg"),
            (None, "Weekends", "Weekend Package",
             "Valid on Saturday and Sunday for Deluxe and Premium Rooms. "
             "Enjoy 10% off the best available rate.",
             "WEEKEND", 2, "/images/pavilion/alchemy-rooftop-sunset.jpg"),
            (None, "Last Minute", "Last Minute Deal",
             "Book within 0–3 days and receive 5% off the best available room rate.",
             "LASTMIN", None, "/images/chancery/deluxe-room-king.jpg"),
            ("pavilion", "Rooftop Dining", "Alchemy Microbrewery Package",
             "Stay & dine at Pavilion: complimentary craft-beer flight for "
             "two at our 10th-floor Alchemy microbrewery, plus buffet "
             "breakfast at Ithaca.",
             "ALCHEMY", 1, "/images/pavilion/alchemy-night.jpg"),
            ("pavilion", "Wedding", "Grand Ballroom Wedding Suite",
             "Book the Grand Ball Room for your wedding and receive a "
             "complimentary bridal-suite upgrade with a poolside cocktail setup.",
             "PAVILIONWED", None, "/images/pavilion/grand-ballroom-banquet.jpg"),
            ("chancery", "Heritage", "Lavelle Road Heritage Stay",
             "Two nights in a heritage suite at The Chancery Hotel with a "
             "Japanese tasting menu for two at Matsuri.",
             "HERITAGE", 2, "/images/chancery/matsuri-dining.jpg"),
            ("chancery", "Business", "Lavelle Business Break",
             "Single-night corporate package on Lavelle Road with breakfast "
             "at South Parade and complimentary airport transfer.",
             "LAVELLEBIZ", None, "/images/chancery/south-parade-lobby.jpg"),
        ]
        for idx, (hslug, tag, title, desc, promo, min_nights, img_rel) in enumerate(items, start=1):
            hotel = None
            if hslug == "chancery":
                hotel = chancery
            elif hslug == "pavilion":
                hotel = pavilion
            offer = Offer.objects.create(
                hotel=hotel,
                tag=tag,
                title=title,
                description=desc,
                promo_code=promo or "",
                min_nights=min_nights,
                order=idx,
            )
            attach(offer, "image", img_path(source, img_rel))
        self.stdout.write(f"  · offers ({Offer.objects.count()})")

    # ---------------------------------------------------------------- gallery
    def _gallery(self, source, chancery, pavilion):
        items = [
            # Chancery Hotel
            ("chancery", "hotel", "/images/chancery/hero.jpg", "The Chancery Hotel exterior"),
            ("chancery", "lobby", "/images/chancery/lobby.jpg", "Chancery Hotel lobby"),
            ("chancery", "rooms", "/images/chancery/deluxe-room-bed.jpg", "Deluxe Room"),
            ("chancery", "rooms", "/images/chancery/deluxe-room-king.jpg", "Deluxe Room — king bed"),
            ("chancery", "rooms", "/images/chancery/premium-room-bed.jpg", "Premium Room"),
            ("chancery", "rooms", "/images/chancery/premium-room-workspace.jpg", "Premium Room — workspace"),
            ("chancery", "dining", "/images/chancery/matsuri-team.jpg", "Matsuri — Japanese"),
            ("chancery", "dining", "/images/chancery/matsuri-dining.jpg", "Matsuri dining hall"),
            ("chancery", "dining", "/images/chancery/matsuri-private.jpg", "Matsuri private dining"),
            ("chancery", "dining", "/images/chancery/south-parade-dining.jpg", "South Parade"),
            ("chancery", "dining", "/images/chancery/south-parade-buffet.jpg", "South Parade buffet"),
            ("chancery", "dining", "/images/chancery/south-parade-lobby.jpg", "South Parade entrance"),
            # Pavilion
            ("pavilion", "hotel", "/images/pavilion/hero.jpg", "Chancery Pavilion exterior at night"),
            ("pavilion", "rooms", "/images/pavilion/superior-room-bed.jpg", "Superior Room"),
            ("pavilion", "rooms", "/images/pavilion/superior-room-lounge.jpg", "Superior Room — lounge"),
            ("pavilion", "rooms", "/images/pavilion/deluxe-room-lounge.jpg", "Deluxe Room — lounge"),
            ("pavilion", "rooms", "/images/pavilion/deluxe-room-bed.jpg", "Deluxe Room — bed"),
            ("pavilion", "rooms", "/images/pavilion/club-pavilion-bed.jpg", "Club Pavilion"),
            ("pavilion", "rooms", "/images/pavilion/club-pavilion-lounge.jpg", "Club Pavilion — lounge"),
            ("pavilion", "rooms", "/images/pavilion/executive-suite-bed.jpg", "Executive Suite — bedroom"),
            ("pavilion", "rooms", "/images/pavilion/executive-suite-living.jpg", "Executive Suite — living"),
            ("pavilion", "rooms", "/images/pavilion/presidential-suite-bed.jpg", "Presidential Suite — bedroom"),
            ("pavilion", "rooms", "/images/pavilion/presidential-suite-living.jpg", "Presidential Suite — living"),
            ("pavilion", "dining", "/images/pavilion/alchemy-rooftop-sunset.jpg", "Alchemy rooftop at sunset"),
            ("pavilion", "dining", "/images/pavilion/alchemy-night.jpg", "Alchemy at night"),
            ("pavilion", "dining", "/images/pavilion/alchemy-bar-interior.jpg", "Alchemy bar interior"),
            ("pavilion", "dining", "/images/pavilion/alchemy-food.jpg", "Alchemy — signature dishes"),
            ("pavilion", "dining", "/images/pavilion/ithaca-dining.jpg", "Ithaca dining hall"),
            ("pavilion", "dining", "/images/pavilion/ithaca-pool-view.jpg", "Ithaca poolside"),
            ("pavilion", "dining", "/images/pavilion/ithaca-buffet-hall.jpg", "Ithaca buffet hall"),
            ("pavilion", "dining", "/images/pavilion/ithaca-buffet-salads.jpg", "Ithaca buffet salads"),
            ("pavilion", "dining", "/images/pavilion/lounge-main.jpg", "The Lounge — reception"),
            ("pavilion", "dining", "/images/pavilion/lounge-bar-view.jpg", "The Lounge — bar"),
            ("pavilion", "dining", "/images/pavilion/lounge-bar.jpg", "The Lounge — cocktails"),
            ("pavilion", "events", "/images/pavilion/grand-ballroom-conference.jpg", "Grand Ball Room — conference"),
            ("pavilion", "events", "/images/pavilion/grand-ballroom-banquet.jpg", "Grand Ball Room — banquet"),
            ("pavilion", "events", "/images/pavilion/grand-ballroom-theatre.jpg", "Grand Ball Room — theatre"),
        ]
        for idx, (hslug, cat, rel, alt) in enumerate(items, start=1):
            hotel = chancery if hslug == "chancery" else pavilion
            src_path = img_path(source, rel)
            if not src_path:
                continue
            g = GalleryImage(hotel=hotel, category=cat, alt=alt, order=idx)
            attach(g, "image", src_path)
        self.stdout.write(f"  · gallery images ({GalleryImage.objects.count()})")

    # --------------------------------------------------------------------- FAQ
    def _faq(self):
        sections = [
            ("Reservations & Check-In", [
                ("What are the check-in and check-out times?",
                 "Standard check-in is 2:00 PM and check-out is 12:00 noon. "
                 "Early check-in and late check-out are subject to availability "
                 "and may attract an additional charge. Please contact the hotel "
                 "in advance and we will do our best to accommodate."),
                ("Can I book a room directly on this website?",
                 "Yes. Use the Book Now button or the booking flow across the "
                 "site. Booking direct helps guests access the best available "
                 "rate and current promotional offers."),
                ("What is the cancellation policy?",
                 "Standard reservations may usually be cancelled up to 48 hours "
                 "before arrival at no charge. Promotional or non-refundable "
                 "rates may carry different terms — please review the final "
                 "policy shown during checkout."),
                ("Is airport transfer available?",
                 "Yes. Both properties can arrange chauffeured airport "
                 "transfers on request. Please contact the hotel or mention it "
                 "during booking so the team can confirm the schedule and charges."),
            ]),
            ("Dining", [
                ("Do I need a reservation for the restaurants?",
                 "Walk-ins are welcome, but reservations are strongly "
                 "recommended for busy meal periods and specialty venues like "
                 "Matsuri and Alchemy."),
                ("Is breakfast included in my room rate?",
                 "Breakfast inclusion depends on the rate plan selected. "
                 "Please check your booking confirmation for the exact package details."),
                ("Are the restaurants open to non-residents?",
                 "Yes. Our restaurants, lounges and dining venues welcome both "
                 "in-house guests and external visitors."),
            ]),
            ("Events & Meetings", [
                ("What event venues are available?",
                 "Both properties offer banquet halls, meeting rooms and "
                 "flexible event spaces for corporate events, celebrations and "
                 "social functions. The event pages include capacity snapshots "
                 "and room details."),
                ("Can I arrange catering for an off-site event?",
                 "Yes. The catering and events team can assist with select "
                 "off-site event requirements. Please contact the team for a "
                 "tailored proposal."),
                ("Is Wi-Fi available in meeting rooms?",
                 "Yes. Complimentary high-speed Wi-Fi is available throughout "
                 "both hotels, including event and meeting spaces."),
            ]),
            ("Facilities & Amenities", [
                ("Is there a swimming pool and fitness centre?",
                 "The Chancery Pavilion offers an outdoor pool and a fitness "
                 "centre. The Chancery Hotel offers a fitness centre for "
                 "staying guests."),
                ("Is parking available at both hotels?",
                 "Yes. On-site parking is available for guests and visitors, "
                 "and valet support is available at select locations."),
                ("Are pets allowed?",
                 "Pets are not currently accommodated. If you travel with a "
                 "service animal, please contact the hotel in advance so the "
                 "team can prepare appropriately."),
            ]),
            ("Accessibility", [
                ("Are the hotels wheelchair accessible?",
                 "Yes. Both properties provide step-free access in key areas, "
                 "lift access and accessible guest arrangements. Please "
                 "mention accessibility needs while booking."),
                ("Do you offer accessibility features on this website?",
                 "Yes. The site includes an accessibility toolbar for "
                 "contrast, text sizing and reading-comfort adjustments."),
            ]),
        ]
        for i, (title, items) in enumerate(sections, start=1):
            section = FAQSection.objects.create(title=title, order=i)
            for j, (q, a) in enumerate(items, start=1):
                FAQItem.objects.create(section=section, question=q, answer=a, order=j)
        self.stdout.write(f"  · FAQ sections ({FAQSection.objects.count()})")

    # ----------------------------------------------------------- testimonials
    def _testimonials(self):
        items = [
            ("The Chancery Hotel exceeded all expectations. The staff's "
             "attention to detail and the elegant ambiance made our anniversary "
             "truly special.", "Arjun & Priya M.", "Anniversary Stay"),
            ("Matsuri at The Chancery serves the best Japanese cuisine in "
             "Bangalore. Chef Okada's sashimi is simply world-class.",
             "Kenji Tanaka", "Business Travel"),
            ("Our wedding reception at The Chancery Pavilion's Grand Ball Room "
             "was nothing short of magical. The team handled everything "
             "flawlessly.", "Sneha & Vikram R.", "Wedding Event"),
            ("As a frequent business traveller, The Chancery Pavilion's Club "
             "rooms and express check-in make every stay seamless and "
             "comfortable.", "David Chen", "Corporate Guest"),
        ]
        for i, (quote, name, title) in enumerate(items, start=1):
            Testimonial.objects.create(quote=quote, name=name, title=title, rating=5, order=i)
        self.stdout.write(f"  · testimonials ({Testimonial.objects.count()})")

    # ------------------------------------------------------------------ pages
    def _pages(self, source, chancery, pavilion):
        # Brand-level pages.
        brand_pages = [
            ("home", "Chancery Hotels — Luxury Hotels in Bangalore",
             "Chancery Hotels | Luxury Hotels in Bangalore",
             "The Chancery Group of Hotels: Premium luxury hotels in Bangalore "
             "offering world-class rooms, fine dining, event venues & exclusive packages.",
             "/images/pavilion/hero.jpg",
             "The Chancery Group of Hotels",
             "Redefining hospitality",
             "Understated luxury with purpose — two distinguished hotels at the "
             "heart of Bangalore, bound by a shared commitment to timeless "
             "hospitality, elegant interiors and the city's most thoughtful dining."),
            ("rooms", "Suites & Rooms", "Suites & Rooms | Chancery Hotels Bangalore",
             "Explore the full collection of rooms and suites across The "
             "Chancery Hotel and The Chancery Pavilion.",
             "/images/pavilion/presidential-suite-living.jpg",
             "Stays", "Rooms & suites",
             "Rest in spaces of quiet luxury — from heritage rooms on Lavelle "
             "Road to the city-view suites of our flagship on Residency Road."),
            ("faq", "Frequently Asked Questions",
             "FAQ | Chancery Hotels",
             "Answers to the most common questions about reservations, dining, "
             "events and amenities at Chancery Hotels.",
             "/images/chancery/lobby.jpg",
             "Guest information", "Frequently asked questions",
             "If a question isn't answered here, our reservations team is "
             "always available — call either property directly or send a note "
             "via the contact form."),
            ("careers", "Careers at Chancery Hotels",
             "Careers | Chancery Hotels",
             "Join the Chancery Hotels family. Discover opportunities across "
             "front office, food & beverage, culinary, events and corporate roles.",
             "/images/common/about-pool.jpg",
             "Careers", "Build a career with us",
             "Chancery Hotels has been a part of Bangalore's hospitality "
             "landscape since 1968. We're always looking for people who share "
             "our love of service, craft and ceremony."),
            ("catering", "Outdoor Catering",
             "Outdoor Catering | Chancery Hotels",
             "Large-scale outdoor catering by Chancery Hotels — 50 to 10,000+ "
             "guests, FSSAI-compliant, with end-to-end logistics and trained chefs.",
             "/images/pavilion/ithaca-buffet-hall.jpg",
             "Outdoor catering", "Proficient in large-scale outdoor catering",
             "Chancery Hotels brings its legacy of hospitality excellence into "
             "the domain of large-scale outdoor catering, with the capability to "
             "efficiently execute orders ranging from 50 to over 10,000 guests. "
             "Professional culinary expertise, robust infrastructure and strict "
             "quality control deliver consistent taste, hygiene and timely "
             "service at scale — backed by trained chefs, standardised "
             "processes and FSSAI-compliant practices."),
            ("privacy", "Privacy Policy", "Privacy Policy | Chancery Hotels",
             "Learn how we collect, use and protect your information when you "
             "interact with Chancery Hotels.",
             None, "Legal", "Privacy policy",
             "This page outlines how Chancery Hotels handles personal "
             "information collected through this website and during your stay."),
            ("terms", "Terms & Conditions",
             "Terms & Conditions | Chancery Hotels",
             "The terms that govern your use of the Chancery Hotels website "
             "and reservations made via it.",
             None, "Legal", "Terms & conditions",
             "By using this website you agree to the terms set out below. "
             "These cover bookings, cancellations, content rights and limits "
             "of liability."),
            ("accessibility", "Accessibility Statement",
             "Accessibility Statement | Chancery Hotels",
             "Our commitment to digital accessibility and the standards we "
             "follow when designing this website.",
             None, "Accessibility", "Accessibility statement",
             "Chancery Hotels is committed to providing a website that is "
             "accessible to the widest possible audience, regardless of "
             "technology or ability."),
            ("sitemap", "Site Map", "Site Map | Chancery Hotels",
             "A full index of pages across The Chancery Hotel and The "
             "Chancery Pavilion.",
             None, "Index", "Site map",
             "A complete index of every page across the Chancery Hotels site."),
        ]
        for kind, title, mtitle, mdesc, hero_rel, eyebrow, heading, intro in brand_pages:
            page = Page.objects.create(
                kind=kind, hotel=None, title=title,
                meta_title=mtitle, meta_description=mdesc,
                hero_eyebrow=eyebrow, hero_heading=heading,
                intro_body=intro,
            )
            if hero_rel:
                attach(page, "hero_image", seed_image(source, hero_rel))

        # Per-hotel pages.
        hotel_pages = {
            chancery: {
                "hero": "/images/chancery/hero.jpg",
                "title": "The Chancery Hotel",
                "pages": [
                    ("hotel_home", "The Chancery Hotel",
                     "The Chancery Hotel | Lavelle Road, Bangalore",
                     "126 rooms of timeless elegance on Lavelle Road. Discover "
                     "heritage hospitality at the original Chancery.",
                     "Heritage on Lavelle Road",
                     "An address that has welcomed Bangalore since 1968.",
                     "Lavelle Road has long been the city's most refined "
                     "address — and The Chancery has been part of it from the "
                     "beginning. 126 rooms, two restaurants, and an unhurried "
                     "kind of luxury that only comes with time."),
                    ("accommodation", "Accommodation at The Chancery Hotel",
                     "Accommodation | The Chancery Hotel, Lavelle Road",
                     "Choose from Deluxe and Premium rooms at The Chancery "
                     "Hotel, Lavelle Road.",
                     "Stay", "Rooms at the Chancery",
                     "Two thoughtfully composed room categories — each one "
                     "carrying the quiet luxury of a Lavelle Road address."),
                    ("dining", "Dining at The Chancery Hotel",
                     "Dining | The Chancery Hotel, Lavelle Road",
                     "Matsuri Japanese cuisine and South Parade multi-cuisine "
                     "all-day dining at The Chancery Hotel.",
                     "Dining", "Two restaurants, one address",
                     "From Chef Okada's sashimi at Matsuri to the global "
                     "comfort of South Parade — dining at The Chancery has "
                     "always been a destination of its own."),
                    ("events", "Plan Your Event at The Chancery Hotel",
                     "Events & Weddings | The Chancery Hotel",
                     "Banquet halls, private dining rooms and a garden "
                     "terrace at The Chancery Hotel, Lavelle Road.",
                     "Events", "Celebrations on Lavelle Road",
                     "Four distinctive venues — from the pillarless Lavelle "
                     "Hall to the open-air Garden Terrace — each tuned to a "
                     "different kind of occasion."),
                    ("offers", "Special Offers — The Chancery Hotel",
                     "Special Offers | The Chancery Hotel",
                     "Curated stay packages and exclusive promotions at The "
                     "Chancery Hotel, Lavelle Road.",
                     "Offers", "Curated packages",
                     "Stay longer, book earlier, or settle into the heritage "
                     "of Lavelle Road on one of our seasonal packages."),
                    ("gallery", "Gallery — The Chancery Hotel",
                     "Gallery | The Chancery Hotel",
                     "Step inside The Chancery Hotel — rooms, dining and the "
                     "spaces that make Lavelle Road feel like home.",
                     "Gallery", "Inside The Chancery", ""),
                    ("contact", "Contact — The Chancery Hotel",
                     "Contact | The Chancery Hotel",
                     "Reach the team at The Chancery Hotel on Lavelle Road "
                     "for reservations, events and special requests.",
                     "Contact", "Reach the Chancery",
                     "Speak directly to the team at 10/6 Lavelle Road for "
                     "reservations, dining and event enquiries."),
                    ("destination", "Lavelle Road & Around",
                     "Destination | The Chancery Hotel",
                     "Explore the neighbourhood around The Chancery Hotel — "
                     "from Cubbon Park to MG Road's best dining.",
                     "Destination", "Lavelle Road and beyond",
                     "Tree-lined Lavelle Road sits at the gentle heart of "
                     "Bangalore — minutes from Cubbon Park, MG Road, "
                     "boutiques, museums and the city's finest cafés."),
                ],
            },
            pavilion: {
                "hero": "/images/pavilion/hero.jpg",
                "title": "The Chancery Pavilion",
                "pages": [
                    ("hotel_home", "The Chancery Pavilion",
                     "The Chancery Pavilion | Residency Road, Bangalore",
                     "223 rooms and suites of contemporary luxury on "
                     "Residency Road. The flagship of The Chancery group.",
                     "Flagship on Residency Road",
                     "Contemporary luxury in the heart of the city.",
                     "The Pavilion is the contemporary face of the Chancery "
                     "brand. 223 rooms, a rooftop microbrewery, a multi-"
                     "cuisine all-day dining destination, an outdoor pool — "
                     "and a grand ballroom that has hosted some of "
                     "Bangalore's most memorable celebrations."),
                    ("accommodation", "Accommodation at The Chancery Pavilion",
                     "Accommodation | The Chancery Pavilion",
                     "Superior, Deluxe, Club, Executive and Presidential "
                     "suites at The Chancery Pavilion, Residency Road.",
                     "Stay", "Rooms & suites at the Pavilion",
                     "Five room categories — from the welcoming Superior to "
                     "the panoramic Presidential — each one designed for the "
                     "modern Bangalore traveller."),
                    ("dining", "Dining at The Chancery Pavilion",
                     "Dining | The Chancery Pavilion",
                     "Alchemy rooftop microbrewery, Ithaca all-day dining "
                     "and The Lounge at The Chancery Pavilion.",
                     "Dining", "Three restaurants, one address",
                     "From craft beers above Cubbon Park to global cuisine "
                     "by the pool — dining at the Pavilion is a journey of "
                     "its own."),
                    ("events", "Plan Your Event at The Chancery Pavilion",
                     "Events & Weddings | The Chancery Pavilion",
                     "Grand Ballroom, conference suites, divisible halls "
                     "and a poolside venue at The Chancery Pavilion.",
                     "Events", "Celebrations at the Pavilion",
                     "Six venues — from the soaring Grand Ball Room to the "
                     "open-air Poolside — each one engineered for the kind "
                     "of celebration you have in mind."),
                    ("offers", "Special Offers — The Chancery Pavilion",
                     "Special Offers | The Chancery Pavilion",
                     "Stay packages, weekend escapes and Alchemy dining "
                     "offers at The Chancery Pavilion.",
                     "Offers", "Curated packages",
                     "Special stay packages, weekend escapes and exclusive "
                     "dining experiences — only at the Pavilion."),
                    ("gallery", "Gallery — The Chancery Pavilion",
                     "Gallery | The Chancery Pavilion",
                     "Step inside The Chancery Pavilion — rooms, dining and "
                     "the spaces that make Residency Road our flagship.",
                     "Gallery", "Inside the Pavilion", ""),
                    ("contact", "Contact — The Chancery Pavilion",
                     "Contact | The Chancery Pavilion",
                     "Reach the team at The Chancery Pavilion on Residency "
                     "Road for reservations, events and special requests.",
                     "Contact", "Reach the Pavilion",
                     "Speak directly to the team at #135 Residency Road for "
                     "reservations, dining and event enquiries."),
                    ("destination", "Residency Road & Around",
                     "Destination | The Chancery Pavilion",
                     "Explore the neighbourhood around The Chancery Pavilion "
                     "— Cubbon Park, MG Road, Brigade Road and Bangalore's "
                     "cultural quarter.",
                     "Destination", "Residency Road and beyond",
                     "Residency Road puts you minutes from Cubbon Park, "
                     "Brigade Road, MG Road and the heart of the city's "
                     "cultural quarter."),
                ],
            },
        }
        for hotel, data in hotel_pages.items():
            for (kind, title, mtitle, mdesc, eyebrow, heading, intro) in data["pages"]:
                page = Page.objects.create(
                    kind=kind, hotel=hotel, title=title,
                    meta_title=mtitle, meta_description=mdesc,
                    hero_eyebrow=eyebrow, hero_heading=heading,
                    intro_body=intro,
                )
                attach(page, "hero_image", seed_image(source, data["hero"]))
        self.stdout.write(f"  · pages ({Page.objects.count()})")
