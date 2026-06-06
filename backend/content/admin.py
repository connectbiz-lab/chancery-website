"""
Admin configuration with image thumbnails so editors can see what's set where.
"""

from django.contrib import admin
from django.utils.html import format_html

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


THUMB = (
    '<img src="{url}" style="height:48px;border-radius:4px;'
    'object-fit:cover;border:1px solid #ddd;" />'
)
THUMB_LG = (
    '<img src="{url}" style="height:160px;border-radius:6px;'
    'object-fit:cover;border:1px solid #ddd;" />'
)


def thumb(img, size="sm"):
    if not img:
        return "—"
    tpl = THUMB if size == "sm" else THUMB_LG
    return format_html(tpl, url=img.url)


# ---------- Site content ----------


@admin.register(SiteContent)
class SiteContentAdmin(admin.ModelAdmin):
    list_display = ["site_title", "tagline", "brand_logo_thumb"]
    readonly_fields = ["og_thumb", "brand_logo_thumb"]
    fieldsets = (
        ("Basics", {"fields": ("site_title", "tagline", "meta_description")}),
        ("Brand logo (navbar + footer)", {
            "fields": ("brand_logo", "brand_logo_thumb"),
        }),
        ("Newsletter", {"fields": ("newsletter_heading", "newsletter_description")}),
        ("Footer & social", {
            "fields": (
                "footer_note",
                "instagram_url",
                "facebook_url",
                "tripadvisor_url",
            )
        }),
        ("Open Graph image", {"fields": ("og_image", "og_thumb")}),
        ("Booking", {"fields": ("synxis_chain_id",)}),
    )

    def og_thumb(self, obj):
        return thumb(obj.og_image, "lg")
    og_thumb.short_description = "OG image preview"

    def brand_logo_thumb(self, obj):
        return thumb(obj.brand_logo, "lg")
    brand_logo_thumb.short_description = "Brand logo preview"

    def has_add_permission(self, request):
        # Singleton — only one row.
        return not SiteContent.objects.exists()


# ---------- Hotels ----------


@admin.register(Hotel)
class HotelAdmin(admin.ModelAdmin):
    list_display = ["name", "location", "rooms_count", "hero_thumb", "order"]
    list_editable = ["order"]
    readonly_fields = ["hero_thumb", "about_thumb", "banner_thumb", "logo_thumb"]
    fieldsets = (
        ("Identity", {"fields": ("slug", "name", "short_name", "tagline", "order")}),
        ("Location & contact", {
            "fields": ("location", "address", "phone", "whatsapp", "email")
        }),
        ("Stats & ratings", {
            "fields": (
                "rooms_count",
                "established",
                "location_tag",
                "tripadvisor_url",
                ("tripadvisor_rating", "tripadvisor_count"),
                ("google_rating", "google_count"),
            )
        }),
        ("Booking", {"fields": ("synxis_id",)}),
        ("Intro copy", {"fields": ("intro_heading", "intro_body")}),
        ("Images", {
            "fields": (
                ("hero_image", "hero_thumb"),
                ("about_image", "about_thumb"),
                ("banner_image", "banner_thumb"),
                ("logo", "logo_thumb"),
            )
        }),
    )

    def hero_thumb(self, obj):
        return thumb(obj.hero_image, "lg")
    hero_thumb.short_description = "Hero preview"

    def about_thumb(self, obj):
        return thumb(obj.about_image, "lg")
    about_thumb.short_description = "About preview"

    def banner_thumb(self, obj):
        return thumb(obj.banner_image, "lg")
    banner_thumb.short_description = "Banner preview"

    def logo_thumb(self, obj):
        return thumb(obj.logo)
    logo_thumb.short_description = "Logo preview"


# ---------- Rooms ----------


class RoomImageInline(admin.TabularInline):
    model = RoomImage
    extra = 1
    fields = ["image", "thumb_preview", "alt", "order"]
    readonly_fields = ["thumb_preview"]

    def thumb_preview(self, obj):
        return thumb(obj.image)
    thumb_preview.short_description = "Preview"


@admin.register(RoomCategory)
class RoomCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "hotel", "size_sqft", "max_guests", "bed_type", "hero_thumb", "order"]
    list_editable = ["order"]
    list_filter = ["hotel"]
    inlines = [RoomImageInline]
    readonly_fields = ["hero_thumb"]
    fieldsets = (
        ("Basics", {"fields": ("hotel", "name", "slug", "order")}),
        ("Details", {"fields": ("size_sqft", "max_guests", "bed_type", "description", "amenities")}),
        ("Booking", {"fields": ("book_url",)}),
        ("Hero image", {"fields": ("hero_image", "hero_thumb")}),
    )

    def hero_thumb(self, obj):
        return thumb(obj.hero_image, "lg")
    hero_thumb.short_description = "Hero preview"


# ---------- Restaurants ----------


class RestaurantImageInline(admin.TabularInline):
    model = RestaurantImage
    extra = 1
    fields = ["image", "thumb_preview", "alt", "order"]
    readonly_fields = ["thumb_preview"]

    def thumb_preview(self, obj):
        return thumb(obj.image)
    thumb_preview.short_description = "Preview"


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ["name", "hotel", "cuisine", "timing", "hero_thumb", "order"]
    list_editable = ["order"]
    list_filter = ["hotel"]
    inlines = [RestaurantImageInline]
    readonly_fields = ["hero_thumb", "logo_thumb"]
    fieldsets = (
        ("Basics", {"fields": ("hotel", "name", "slug", "order")}),
        ("Details", {"fields": ("cuisine", "timing", "description")}),
        ("Images", {"fields": (("hero_image", "hero_thumb"), ("logo", "logo_thumb"))}),
    )

    def hero_thumb(self, obj):
        return thumb(obj.hero_image, "lg")
    hero_thumb.short_description = "Hero preview"

    def logo_thumb(self, obj):
        return thumb(obj.logo)
    logo_thumb.short_description = "Logo preview"


# ---------- Venues ----------


class VenueImageInline(admin.TabularInline):
    model = VenueImage
    extra = 1
    fields = ["image", "thumb_preview", "alt", "order"]
    readonly_fields = ["thumb_preview"]

    def thumb_preview(self, obj):
        return thumb(obj.image)
    thumb_preview.short_description = "Preview"


@admin.register(Venue)
class VenueAdmin(admin.ModelAdmin):
    list_display = ["name", "hotel", "kind", "guests_max", "area_sqft", "hero_thumb", "order"]
    list_editable = ["order"]
    list_filter = ["hotel", "kind"]
    inlines = [VenueImageInline]
    readonly_fields = ["hero_thumb"]
    fieldsets = (
        ("Basics", {"fields": ("hotel", "name", "slug", "kind", "order")}),
        ("Description", {"fields": ("description",)}),
        ("Dimensions", {"fields": ("area_sqft", "dimensions", "ceiling_ft", "guests_max")}),
        ("Capacities", {
            "fields": (
                "cap_theatre",
                "cap_banquet",
                "cap_classroom",
                "cap_ushape",
                "cap_cocktail",
            )
        }),
        ("Pricing (INR)", {"fields": ("half_day_inr", "full_day_inr", "per_plate_inr")}),
        ("Hero image", {"fields": ("hero_image", "hero_thumb")}),
    )

    def hero_thumb(self, obj):
        return thumb(obj.hero_image, "lg")
    hero_thumb.short_description = "Hero preview"


# ---------- Offers ----------


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ["title", "hotel", "tag", "promo_code", "image_thumb", "order"]
    list_editable = ["order"]
    list_filter = ["hotel"]
    readonly_fields = ["image_thumb"]
    fieldsets = (
        ("Basics", {"fields": ("hotel", "tag", "title", "description", "order")}),
        ("Booking", {"fields": ("promo_code", "min_nights")}),
        ("Image", {"fields": ("image", "image_thumb")}),
    )

    def image_thumb(self, obj):
        return thumb(obj.image, "lg")
    image_thumb.short_description = "Preview"


# ---------- Gallery ----------


@admin.register(GalleryImage)
class GalleryImageAdmin(admin.ModelAdmin):
    list_display = ["__str__", "hotel", "category", "image_thumb", "order"]
    list_editable = ["order"]
    list_filter = ["hotel", "category"]
    readonly_fields = ["image_thumb"]
    fields = ["hotel", "category", "image", "image_thumb", "alt", "order"]

    def image_thumb(self, obj):
        return thumb(obj.image, "lg")
    image_thumb.short_description = "Preview"


# ---------- FAQ ----------


class FAQItemInline(admin.TabularInline):
    model = FAQItem
    extra = 1
    fields = ["question", "answer", "order"]


@admin.register(FAQSection)
class FAQSectionAdmin(admin.ModelAdmin):
    list_display = ["title", "order"]
    list_editable = ["order"]
    inlines = [FAQItemInline]


# ---------- Testimonials ----------


@admin.register(Testimonial)
class TestimonialAdmin(admin.ModelAdmin):
    list_display = ["name", "title", "rating", "order"]
    list_editable = ["order"]


# ---------- Pages ----------


class PageSectionInline(admin.StackedInline):
    model = PageSection
    extra = 1
    fields = (
        "kind",
        "eyebrow",
        "title",
        "body",
        ("image", "image_thumb"),
        "image_alt",
        ("cta_label", "cta_url"),
        "order",
    )
    readonly_fields = ["image_thumb"]

    def image_thumb(self, obj):
        return thumb(obj.image, "lg")
    image_thumb.short_description = "Preview"


@admin.register(Page)
class PageAdmin(admin.ModelAdmin):
    list_display = ["__str__", "kind", "hotel", "hero_thumb"]
    list_filter = ["kind", "hotel"]
    inlines = [PageSectionInline]
    readonly_fields = ["hero_thumb"]
    fieldsets = (
        ("Identity", {"fields": ("kind", "hotel", "title")}),
        ("SEO", {"fields": ("meta_title", "meta_description")}),
        ("Hero", {
            "fields": (
                ("hero_image", "hero_thumb"),
                "hero_eyebrow",
                "hero_heading",
                "hero_subheading",
            )
        }),
        ("Intro body", {"fields": ("intro_body",)}),
    )

    def hero_thumb(self, obj):
        return thumb(obj.hero_image, "lg")
    hero_thumb.short_description = "Hero preview"
