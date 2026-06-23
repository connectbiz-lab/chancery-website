"""
Routing resolver — turns a website enquiry into the right team recipients.

This is the lookup the notify step (contact_submit) calls. It maps the public
"interest" to a department, then resolves recipients from the DepartmentContact
table with a safe fallback chain so an enquiry is *never* dropped.
"""

from django.conf import settings

from .models import DepartmentContact

# Public enquiry "interest" → routing department.
INTEREST_TO_DEPARTMENT = {
    "stay": "reservations",
    "dining": "dining",
    "event": "events",
    "catering": "catering",
    "careers": "careers",
    "other": "general",
}


def _find(hotel, department):
    return DepartmentContact.objects.filter(
        hotel=hotel, department=department, is_active=True
    ).first()


def resolve_routing(hotel_interest, interest):
    """
    Return (recipients: list[str], department_label: str, contact: DepartmentContact | None).

    Fallback chain: (hotel, dept) → (both, dept) → (hotel, general) → (both, general)
    → DEFAULT_FROM_EMAIL. Always returns at least one recipient.
    """
    department = INTEREST_TO_DEPARTMENT.get(interest, "general")
    hotel = hotel_interest if hotel_interest in ("chancery", "pavilion") else "both"

    contact = (
        _find(hotel, department)
        or _find("both", department)
        or _find(hotel, "general")
        or _find("both", "general")
    )

    if contact:
        recipients = [contact.notify_email] + [
            e.strip() for e in contact.cc_emails.split(",") if e.strip()
        ]
        return recipients, contact.get_department_display(), contact

    return [settings.DEFAULT_FROM_EMAIL], "General Enquiry", None
