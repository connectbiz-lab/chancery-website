from django.contrib import admin

from .models import DepartmentContact, Lead, NewsletterSubscriber


@admin.register(DepartmentContact)
class DepartmentContactAdmin(admin.ModelAdmin):
    list_display = ["hotel", "department", "notify_email", "whatsapp_number", "is_active"]
    list_filter = ["hotel", "department", "is_active"]
    list_editable = ["notify_email", "whatsapp_number", "is_active"]
    search_fields = ["notify_email", "cc_emails", "whatsapp_number"]


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ["created_at", "name", "email", "interest", "hotel_interest", "status", "routed_to"]
    list_filter = ["status", "interest", "hotel_interest", "created_at"]
    list_editable = ["status"]
    search_fields = ["name", "email", "phone", "message"]
    readonly_fields = ["created_at", "routed_to"]
    ordering = ["-created_at"]


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(admin.ModelAdmin):
    list_display = ["email", "created_at"]
    readonly_fields = ["created_at"]
    search_fields = ["email"]
