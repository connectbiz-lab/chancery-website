from django.db import models


INTEREST_CHOICES = [
    ("stay", "Stay / Room booking"),
    ("dining", "Dining reservation"),
    ("event", "Event or wedding"),
    ("catering", "Outdoor catering"),
    ("careers", "Careers"),
    ("other", "Other"),
]

HOTEL_INTEREST_CHOICES = [
    ("chancery", "The Chancery Hotel"),
    ("pavilion", "Chancery Pavilion"),
    ("either", "No preference"),
]

LEAD_STATUS_CHOICES = [
    ("new", "New"),
    ("in_progress", "In progress"),
    ("resolved", "Resolved"),
]


class Lead(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    phone = models.CharField(max_length=40, blank=True)
    interest = models.CharField(max_length=40, choices=INTEREST_CHOICES, default="stay")
    hotel_interest = models.CharField(
        max_length=20, choices=HOTEL_INTEREST_CHOICES, default="either"
    )
    message = models.TextField(blank=True)
    page = models.CharField(
        max_length=120, blank=True, help_text="Page or context the lead was submitted from."
    )
    # Table-booking fields (only set for "Book a Table" / dining enquiries).
    restaurant = models.CharField(max_length=200, blank=True)
    covers = models.PositiveSmallIntegerField(null=True, blank=True, help_text="Number of guests.")
    preferred_date = models.DateField(null=True, blank=True)
    preferred_time = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=LEAD_STATUS_CHOICES, default="new")
    routed_to = models.CharField(
        max_length=200, blank=True, help_text="Where the enquiry was emailed (audit trail)."
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name} <{self.email}> — {self.interest}"


class NewsletterSubscriber(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Newsletter subscriber"

    def __str__(self):
        return self.email


DEPARTMENT_CHOICES = [
    ("reservations", "Reservations"),
    ("dining", "Dining"),
    ("sales", "Sales"),
    ("events", "Meetings & Events"),
    ("catering", "Outdoor Catering"),
    ("careers", "Careers"),
    ("general", "General Enquiry"),
]

HOTEL_SCOPE_CHOICES = [
    ("chancery", "The Chancery Hotel"),
    ("pavilion", "Chancery Pavilion"),
    ("both", "Both / Brand-level"),
]


class DepartmentContact(models.Model):
    """
    Routing table: who gets notified for a given (hotel, department) enquiry.

    Channel-agnostic by design — each row holds an email now and a WhatsApp
    number / Slack webhook for later. v1 sends email; turning on WhatsApp or
    Slack is just filling in the field here, no schema change. This is the single
    place that decides WHO is notified; the columns are the CHANNELS.
    """

    hotel = models.CharField(max_length=20, choices=HOTEL_SCOPE_CHOICES)
    department = models.CharField(max_length=30, choices=DEPARTMENT_CHOICES)
    notify_email = models.EmailField(help_text="Primary inbox for this enquiry type.")
    cc_emails = models.CharField(
        max_length=400, blank=True, help_text="Optional extra recipients, comma-separated."
    )
    phone = models.CharField(
        max_length=40, blank=True, help_text="Optional direct line shown to guests for this department."
    )
    public = models.BooleanField(
        default=True, help_text="Show this department's email/phone publicly on the contact page."
    )
    whatsapp_number = models.CharField(
        max_length=20,
        blank=True,
        help_text="Digits incl. country code, no '+'. Team WhatsApp alerts (used later).",
    )
    slack_webhook = models.URLField(
        blank=True, help_text="Optional Slack/Teams incoming webhook for fast alerts."
    )
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = [("hotel", "department")]
        ordering = ["hotel", "department"]
        verbose_name = "Department contact (routing)"
        verbose_name_plural = "Department contacts (routing)"

    def __str__(self):
        return f"{self.get_hotel_display()} — {self.get_department_display()} → {self.notify_email}"
