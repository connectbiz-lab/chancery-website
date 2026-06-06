from django.contrib import admin

from .models import Lead, NewsletterSubscriber


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ["created_at", "name", "email", "phone", "interest", "hotel_interest"]
    list_filter = ["interest", "hotel_interest", "created_at"]
    search_fields = ["name", "email", "phone", "message"]
    readonly_fields = ["created_at"]
    ordering = ["-created_at"]


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ["email", "created_at"]
    readonly_fields = ["created_at"]
    search_fields = ["email"]
