"""
Seed the department routing table from the published Reach Us details.

Idempotent — re-running updates each (hotel, department) row in place. Edit
recipients afterwards in Django admin, not here. WhatsApp numbers are left blank
on purpose; staff fill them in when the WhatsApp alert channel is turned on.
"""

from django.core.management.base import BaseCommand

from leads.models import DepartmentContact

# (hotel, department, notify_email, phone, public)
ROUTING = [
    # The Chancery Hotel (TCH)
    ("chancery", "reservations", "reservations.tch@chanceryhotels.com", "", True),
    ("chancery", "dining", "reservations.tch@chanceryhotels.com", "", False),
    ("chancery", "events", "ban.tch@chanceryhotels.com", "", True),
    ("chancery", "catering", "ban.tch@chanceryhotels.com", "", True),
    # Chancery Pavilion (TCP)
    ("pavilion", "reservations", "reservations.tcp@chanceryhotels.com", "080-6989 4646", True),
    ("pavilion", "dining", "reservations.tcp@chanceryhotels.com", "", False),
    ("pavilion", "events", "ban.tcp@chanceryhotels.com", "", True),
    ("pavilion", "catering", "ban.tcp@chanceryhotels.com", "", True),
    # Brand-level (shared across both)
    ("both", "sales", "sales@chanceryhotels.com", "", True),
    ("both", "careers", "jobs@chanceryhotels.com", "", True),
    # General is the routing fallback only — not shown publicly (Sales already is).
    ("both", "general", "sales@chanceryhotels.com", "", False),
]


class Command(BaseCommand):
    help = "Seed/refresh the DepartmentContact routing table."

    def handle(self, *args, **options):
        for hotel, dept, email, phone, public in ROUTING:
            obj, created = DepartmentContact.objects.update_or_create(
                hotel=hotel,
                department=dept,
                defaults={"notify_email": email, "phone": phone, "public": public},
            )
            verb = "created" if created else "updated"
            self.stdout.write(f"  {verb}: {obj}")
        self.stdout.write(self.style.SUCCESS(f"Done — {len(ROUTING)} routing rows."))
