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
