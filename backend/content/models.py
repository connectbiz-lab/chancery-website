"""
Content models for the Chancery Hotels site.

Two properties (Hotel) share one codebase. Most content is scoped to a Hotel
via FK; site-wide content (offers, FAQ sections, testimonials, SiteContent)
can be unscoped (hotel=None) to apply to both.
"""

from django.db import models
from django.utils.text import slugify


HOTEL_CHOICES = [("chancery", "The Chancery Hotel"), ("pavilion", "Chancery Pavilion")]


class SiteContent(models.Model):
    """Singleton-ish settings for site-wide copy (newsletter, footer, OG image)."""

    site_title = models.CharField(max_length=200, default="Chancery Hotels")
    tagline = models.CharField(max_length=300, default="Luxury Hotels in Bangalore")
    meta_description = models.TextField(
        default="The Chancery Group of Hotels: Premium luxury hotels in Bangalore "
        "offering world-class rooms, fine dining, event venues & exclusive packages."
    )
    footer_note = models.TextField(blank=True)
    newsletter_heading = models.CharField(max_length=200, default="Stay in touch")
    newsletter_description = models.TextField(blank=True)
    og_image = models.ImageField(upload_to="brand/", blank=True, null=True)
    brand_logo = models.ImageField(
        upload_to="brand/",
        blank=True,
        null=True,
        help_text="Master 'Chancery Hotels' group logo. Shown in the navbar on "
        "all brand-level pages, and in the footer.",
    )
    instagram_url = models.URLField(blank=True)
    facebook_url = models.URLField(blank=True)
    tripadvisor_url = models.URLField(blank=True)
    synxis_chain_id = models.CharField(max_length=20, default="18850")

    class Meta:
        verbose_name = "Site content"
        verbose_name_plural = "Site content"

    def __str__(self):
        return self.site_title

    def save(self, *args, **kwargs):
        # Enforce singleton — always pk=1.
        self.pk = 1
        super().save(*args, **kwargs)


class Hotel(models.Model):
    """One of the two Chancery properties."""

    slug = models.SlugField(unique=True, choices=HOTEL_CHOICES)
    name = models.CharField(max_length=200)
    short_name = models.CharField(max_length=120, blank=True)
    tagline = models.CharField(max_length=300, blank=True)
    location = models.CharField(max_length=200, blank=True, help_text="e.g. Lavelle Road")
    address = models.CharField(max_length=300, blank=True)
    phone = models.CharField(max_length=40, blank=True, help_text="Primary line, shown everywhere.")
    phone_alt = models.CharField(
        max_length=80, blank=True, help_text="Secondary / board line, e.g. 'Board: 080-69894666'."
    )
    fax = models.CharField(max_length=40, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True, help_text="Digits only, no +")
    email = models.EmailField(blank=True)
    rooms_count = models.PositiveIntegerField(default=0)
    established = models.CharField(max_length=20, blank=True)
    location_tag = models.CharField(max_length=60, blank=True, help_text="e.g. Flagship, Heritage")
    synxis_id = models.CharField(max_length=20, blank=True)
    tripadvisor_url = models.URLField(blank=True)
    tripadvisor_rating = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    tripadvisor_count = models.PositiveIntegerField(null=True, blank=True)
    google_rating = models.DecimalField(max_digits=2, decimal_places=1, null=True, blank=True)
    google_count = models.PositiveIntegerField(null=True, blank=True)
    hero_image = models.ImageField(upload_to="hotels/", blank=True, null=True)
    about_image = models.ImageField(upload_to="hotels/", blank=True, null=True)
    banner_image = models.ImageField(upload_to="hotels/", blank=True, null=True)
    logo = models.ImageField(upload_to="brand/", blank=True, null=True)
    intro_heading = models.CharField(max_length=200, blank=True)
    intro_body = models.TextField(blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "name"]

    def __str__(self):
        return self.name


class RoomCategory(models.Model):
    hotel = models.ForeignKey(Hotel, related_name="rooms", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120, blank=True)
    size_sqft = models.PositiveIntegerField(null=True, blank=True)
    max_guests = models.PositiveSmallIntegerField(default=2)
    bed_type = models.CharField(max_length=120, blank=True)
    description = models.TextField(blank=True)
    amenities = models.TextField(blank=True, help_text="One per line. Rendered as a list.")
    hero_image = models.ImageField(upload_to="rooms/", blank=True, null=True)
    book_url = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["hotel__order", "order", "name"]
        verbose_name_plural = "Room categories"

    def __str__(self):
        return f"{self.hotel.short_name or self.hotel.name} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:120]
        super().save(*args, **kwargs)


class RoomImage(models.Model):
    room = models.ForeignKey(RoomCategory, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="rooms/")
    alt = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.alt or self.image.name


class Restaurant(models.Model):
    hotel = models.ForeignKey(Hotel, related_name="restaurants", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120, blank=True)
    cuisine = models.CharField(max_length=200, blank=True)
    timing = models.CharField(max_length=200, blank=True)
    description = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to="dining/", blank=True, null=True)
    logo = models.ImageField(upload_to="brand/", blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["hotel__order", "order", "name"]

    def __str__(self):
        return f"{self.hotel.short_name or self.hotel.name} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:120]
        super().save(*args, **kwargs)


class RestaurantImage(models.Model):
    restaurant = models.ForeignKey(Restaurant, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="dining/")
    alt = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.alt or self.image.name


VENUE_KIND_CHOICES = [
    ("ballroom", "Ballroom"),
    ("banquet", "Banquet"),
    ("conference", "Conference Suite"),
    ("private_dining", "Private Dining"),
    ("executive", "Executive Boardroom"),
    ("al_fresco", "Al Fresco"),
    ("divisible", "Divisible Hall"),
]


class Venue(models.Model):
    hotel = models.ForeignKey(Hotel, related_name="venues", on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=120, blank=True)
    kind = models.CharField(max_length=40, choices=VENUE_KIND_CHOICES, blank=True)
    description = models.TextField(blank=True)
    area_sqft = models.PositiveIntegerField(null=True, blank=True)
    dimensions = models.CharField(max_length=120, blank=True, help_text="e.g. 96 x 53 ft")
    ceiling_ft = models.PositiveSmallIntegerField(null=True, blank=True)
    guests_max = models.PositiveIntegerField(null=True, blank=True)
    cap_theatre = models.PositiveIntegerField(null=True, blank=True)
    cap_banquet = models.PositiveIntegerField(null=True, blank=True)
    cap_classroom = models.PositiveIntegerField(null=True, blank=True)
    cap_ushape = models.PositiveIntegerField(null=True, blank=True)
    cap_cocktail = models.PositiveIntegerField(null=True, blank=True)
    half_day_inr = models.PositiveIntegerField(null=True, blank=True)
    full_day_inr = models.PositiveIntegerField(null=True, blank=True)
    per_plate_inr = models.PositiveIntegerField(null=True, blank=True)
    hero_image = models.ImageField(upload_to="venues/", blank=True, null=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["hotel__order", "order", "name"]

    def __str__(self):
        return f"{self.hotel.short_name or self.hotel.name} — {self.name}"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)[:120]
        super().save(*args, **kwargs)


class VenueImage(models.Model):
    venue = models.ForeignKey(Venue, related_name="images", on_delete=models.CASCADE)
    image = models.ImageField(upload_to="venues/")
    alt = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.alt or self.image.name


class Offer(models.Model):
    """A package / promotion. Hotel-scoped if hotel is set, otherwise shared."""

    tag = models.CharField(max_length=80, blank=True, help_text="Short label, e.g. Early Bird")
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="offers/", blank=True, null=True)
    promo_code = models.CharField(max_length=40, blank=True, help_text="SynXis promo code")
    min_nights = models.PositiveSmallIntegerField(null=True, blank=True)
    hotel = models.ForeignKey(
        Hotel,
        related_name="offers",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Leave blank for shared offers that apply to both properties.",
    )
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "title"]

    def __str__(self):
        scope = self.hotel.short_name if self.hotel else "Shared"
        return f"{scope} — {self.title}"


GALLERY_CATEGORY_CHOICES = [
    ("hotel", "Hotel"),
    ("lobby", "Lobby"),
    ("rooms", "Rooms"),
    ("dining", "Dining"),
    ("events", "Events"),
]


class GalleryImage(models.Model):
    hotel = models.ForeignKey(
        Hotel,
        related_name="gallery_images",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text="Leave blank for shared brand images.",
    )
    category = models.CharField(max_length=20, choices=GALLERY_CATEGORY_CHOICES, default="hotel")
    image = models.ImageField(upload_to="gallery/")
    alt = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["hotel__order", "category", "order"]

    def __str__(self):
        scope = self.hotel.short_name if self.hotel else "Shared"
        return f"{scope} / {self.get_category_display()} — {self.alt or self.image.name}"


class FAQSection(models.Model):
    title = models.CharField(max_length=200)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "title"]
        verbose_name = "FAQ section"
        verbose_name_plural = "FAQ sections"

    def __str__(self):
        return self.title


class FAQItem(models.Model):
    section = models.ForeignKey(FAQSection, related_name="items", on_delete=models.CASCADE)
    question = models.CharField(max_length=400)
    answer = models.TextField()
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]
        verbose_name = "FAQ item"
        verbose_name_plural = "FAQ items"

    def __str__(self):
        return self.question


class Testimonial(models.Model):
    quote = models.TextField()
    name = models.CharField(max_length=120)
    title = models.CharField(max_length=200, blank=True, help_text="e.g. 'Anniversary Stay'")
    rating = models.PositiveSmallIntegerField(default=5)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.name} — {self.title}"


PAGE_KIND_CHOICES = [
    ("home", "Brand home"),
    ("rooms", "All rooms"),
    ("faq", "FAQ"),
    ("careers", "Careers"),
    ("catering", "Catering"),
    ("privacy", "Privacy"),
    ("terms", "Terms"),
    ("accessibility", "Accessibility"),
    ("sitemap", "Site map"),
    ("hotel_home", "Hotel home"),
    ("accommodation", "Accommodation"),
    ("dining", "Dining"),
    ("events", "Plan your event"),
    ("offers", "Special offers"),
    ("gallery", "Gallery"),
    ("contact", "Contact us"),
    ("experience", "Experience"),
    ("destination", "Destination"),
]


class Page(models.Model):
    """
    Page-level content: title, meta tags, hero. Body sections come via PageSection.
    A page is either site-wide (hotel=None) or scoped to one hotel.
    """

    kind = models.CharField(max_length=40, choices=PAGE_KIND_CHOICES)
    hotel = models.ForeignKey(
        Hotel, related_name="pages", on_delete=models.CASCADE, null=True, blank=True
    )
    title = models.CharField(max_length=200)
    meta_title = models.CharField(max_length=200, blank=True)
    meta_description = models.TextField(blank=True)
    hero_image = models.ImageField(upload_to="pages/", blank=True, null=True)
    hero_eyebrow = models.CharField(max_length=120, blank=True)
    hero_heading = models.CharField(max_length=300, blank=True)
    hero_subheading = models.TextField(blank=True)
    intro_body = models.TextField(blank=True)

    class Meta:
        unique_together = [("kind", "hotel")]
        ordering = ["kind"]

    def __str__(self):
        scope = self.hotel.short_name if self.hotel else "Brand"
        return f"{scope} — {self.get_kind_display()}"


class PageSection(models.Model):
    SECTION_KINDS = [
        ("text", "Text block"),
        ("text_image", "Text + image"),
        ("image_text", "Image + text"),
        ("callout", "Callout / quote"),
        ("cta", "Call to action"),
    ]
    page = models.ForeignKey(Page, related_name="sections", on_delete=models.CASCADE)
    kind = models.CharField(max_length=20, choices=SECTION_KINDS, default="text")
    eyebrow = models.CharField(max_length=120, blank=True)
    title = models.CharField(max_length=300, blank=True)
    body = models.TextField(blank=True)
    image = models.ImageField(upload_to="pages/", blank=True, null=True)
    image_alt = models.CharField(max_length=300, blank=True)
    cta_label = models.CharField(max_length=120, blank=True)
    cta_url = models.CharField(max_length=300, blank=True)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return f"{self.page} / {self.title or self.kind} [{self.order}]"
