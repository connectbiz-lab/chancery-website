"""
Auto-optimize every uploaded image.

A single ``pre_save`` receiver covers all image-bearing content models, so any
admin upload — or seeded image — is converted to WebP + responsive variants by
``imaging.optimize`` before the row is written. Already-optimized (``.webp``)
files are skipped, so re-saving a record is a no-op.
"""

from django.db.models import ImageField
from django.db.models.signals import pre_save
from django.dispatch import receiver

from . import models as m
from .imaging import optimize

IMAGE_MODELS = (
    m.SiteContent,
    m.Hotel,
    m.RoomCategory,
    m.RoomImage,
    m.Restaurant,
    m.RestaurantImage,
    m.Venue,
    m.VenueImage,
    m.Offer,
    m.GalleryImage,
    m.Page,
    m.PageSection,
)


def image_field_names(instance):
    return [f.name for f in instance._meta.get_fields() if isinstance(f, ImageField)]


@receiver(pre_save)
def optimize_images(sender, instance, **kwargs):
    if sender not in IMAGE_MODELS:
        return
    for name in image_field_names(instance):
        fieldfile = getattr(instance, name)
        if not fieldfile:
            continue
        new_name = optimize(fieldfile)
        if new_name:
            setattr(instance, name, new_name)
