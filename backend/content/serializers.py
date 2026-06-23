from django.db.models import Q
from rest_framework import serializers

from leads.models import DEPARTMENT_CHOICES, DepartmentContact

from .models import (
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


def list_from_lines(text):
    return [line.strip() for line in (text or "").splitlines() if line.strip()]


class SiteContentSerializer(serializers.ModelSerializer):
    og_image = serializers.ImageField(read_only=True)
    brand_logo = serializers.ImageField(read_only=True)

    class Meta:
        model = SiteContent
        fields = [
            "site_title",
            "tagline",
            "meta_description",
            "footer_note",
            "newsletter_heading",
            "newsletter_description",
            "og_image",
            "brand_logo",
            "instagram_url",
            "facebook_url",
            "tripadvisor_url",
            "synxis_chain_id",
        ]


class HotelMiniSerializer(serializers.ModelSerializer):
    """Lightweight nested representation used inside other serializers."""

    class Meta:
        model = Hotel
        fields = ["id", "slug", "name", "short_name", "location"]


_DEPT_ORDER = {key: i for i, (key, _) in enumerate(DEPARTMENT_CHOICES)}


class HotelSerializer(serializers.ModelSerializer):
    departments = serializers.SerializerMethodField()

    def get_departments(self, obj):
        """Public department contacts for this hotel + brand-level ('both'),
        sourced from the routing table so display and routing share one truth."""
        rows = DepartmentContact.objects.filter(
            Q(hotel=obj.slug) | Q(hotel="both"), is_active=True, public=True
        )
        rows = sorted(rows, key=lambda r: _DEPT_ORDER.get(r.department, 99))
        return [
            {"label": r.get_department_display(), "email": r.notify_email, "phone": r.phone}
            for r in rows
        ]

    class Meta:
        model = Hotel
        fields = [
            "id",
            "slug",
            "name",
            "short_name",
            "tagline",
            "location",
            "address",
            "phone",
            "phone_alt",
            "fax",
            "whatsapp",
            "email",
            "departments",
            "rooms_count",
            "established",
            "location_tag",
            "synxis_id",
            "tripadvisor_url",
            "tripadvisor_rating",
            "tripadvisor_count",
            "google_rating",
            "google_count",
            "hero_image",
            "about_image",
            "banner_image",
            "logo",
            "intro_heading",
            "intro_body",
            "order",
        ]


class RoomImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomImage
        fields = ["image", "alt", "order"]


class RoomSerializer(serializers.ModelSerializer):
    hotel = HotelMiniSerializer(read_only=True)
    images = RoomImageSerializer(many=True, read_only=True)
    amenities_list = serializers.SerializerMethodField()

    class Meta:
        model = RoomCategory
        fields = [
            "id",
            "hotel",
            "name",
            "slug",
            "size_sqft",
            "max_guests",
            "bed_type",
            "description",
            "amenities",
            "amenities_list",
            "hero_image",
            "book_url",
            "images",
            "order",
        ]

    def get_amenities_list(self, obj):
        return list_from_lines(obj.amenities)


class RestaurantImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RestaurantImage
        fields = ["image", "alt", "order"]


class RestaurantSerializer(serializers.ModelSerializer):
    hotel = HotelMiniSerializer(read_only=True)
    images = RestaurantImageSerializer(many=True, read_only=True)

    class Meta:
        model = Restaurant
        fields = [
            "id",
            "hotel",
            "name",
            "slug",
            "cuisine",
            "timing",
            "description",
            "hero_image",
            "logo",
            "images",
            "order",
        ]


class VenueImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = VenueImage
        fields = ["image", "alt", "order"]


class VenueSerializer(serializers.ModelSerializer):
    hotel = HotelMiniSerializer(read_only=True)
    images = VenueImageSerializer(many=True, read_only=True)

    class Meta:
        model = Venue
        fields = [
            "id",
            "hotel",
            "name",
            "slug",
            "kind",
            "description",
            "area_sqft",
            "dimensions",
            "ceiling_ft",
            "guests_max",
            "cap_theatre",
            "cap_banquet",
            "cap_classroom",
            "cap_ushape",
            "cap_cocktail",
            "half_day_inr",
            "full_day_inr",
            "per_plate_inr",
            "hero_image",
            "images",
            "order",
        ]


class OfferSerializer(serializers.ModelSerializer):
    hotel = HotelMiniSerializer(read_only=True)

    class Meta:
        model = Offer
        fields = [
            "id",
            "tag",
            "title",
            "description",
            "image",
            "promo_code",
            "min_nights",
            "hotel",
            "order",
        ]


class GalleryImageSerializer(serializers.ModelSerializer):
    hotel = HotelMiniSerializer(read_only=True)

    class Meta:
        model = GalleryImage
        fields = ["id", "hotel", "category", "image", "alt", "order"]


class FAQItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FAQItem
        fields = ["id", "question", "answer", "order"]


class FAQSectionSerializer(serializers.ModelSerializer):
    items = FAQItemSerializer(many=True, read_only=True)

    class Meta:
        model = FAQSection
        fields = ["id", "title", "order", "items"]


class TestimonialSerializer(serializers.ModelSerializer):
    class Meta:
        model = Testimonial
        fields = ["id", "quote", "name", "title", "rating", "order"]


class PageSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = PageSection
        fields = [
            "id",
            "kind",
            "eyebrow",
            "title",
            "body",
            "image",
            "image_alt",
            "cta_label",
            "cta_url",
            "order",
        ]


class PageSerializer(serializers.ModelSerializer):
    hotel = HotelMiniSerializer(read_only=True)
    sections = PageSectionSerializer(many=True, read_only=True)

    class Meta:
        model = Page
        fields = [
            "id",
            "kind",
            "hotel",
            "title",
            "meta_title",
            "meta_description",
            "hero_image",
            "hero_eyebrow",
            "hero_heading",
            "hero_subheading",
            "intro_body",
            "sections",
        ]
