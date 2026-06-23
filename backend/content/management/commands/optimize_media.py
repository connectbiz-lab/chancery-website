"""
One-off: convert already-seeded media to optimized WebP + responsive variants.

New uploads are handled automatically by the pre_save signal; this command
back-fills existing records. Idempotent — images already stored as ``.webp``
are skipped, so it is safe to re-run.
"""

from django.core.management.base import BaseCommand

from content.imaging import optimize
from content.signals import IMAGE_MODELS, image_field_names


class Command(BaseCommand):
    help = "Convert existing media images to optimized WebP + responsive variants."

    def handle(self, *args, **options):
        converted = 0
        for model in IMAGE_MODELS:
            for obj in model.objects.all():
                changed = False
                for name in image_field_names(obj):
                    fieldfile = getattr(obj, name)
                    if fieldfile and not fieldfile.name.lower().endswith(".webp"):
                        new_name = optimize(fieldfile)
                        if new_name:
                            setattr(obj, name, new_name)
                            changed = True
                            converted += 1
                if changed:
                    obj.save()
                    self.stdout.write(f"  optimized {model.__name__} #{obj.pk}")
        self.stdout.write(self.style.SUCCESS(f"Done — {converted} image(s) converted."))
