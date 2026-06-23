from django.conf import settings
from django.core.mail import EmailMessage
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import NewsletterSubscriber
from .routing import resolve_routing
from .serializers import LeadSerializer, NewsletterSubscriberSerializer


def _notify_department(lead, recipients, dept_label):
    """Email the owning department. Reply-To is the guest, so staff just hit
    reply to respond to them directly."""
    is_table = lead.interest == "dining" and (lead.restaurant or lead.covers or lead.preferred_date)
    is_event = lead.interest == "event" and (lead.venue or lead.event_type or lead.covers)
    if is_table:
        subject = f"[Chancery — {dept_label}] Table request from {lead.name}"
    elif is_event:
        subject = f"[Chancery — {dept_label}] Event enquiry from {lead.name}"
    else:
        subject = f"[Chancery — {dept_label}] New enquiry from {lead.name}"

    table_block = ""
    if is_table:
        table_block = (
            f"Restaurant: {lead.restaurant or '—'}\n"
            f"Guests:     {lead.covers or '—'}\n"
            f"Date:       {lead.preferred_date or '—'}\n"
            f"Time:       {lead.preferred_time or '—'}\n"
        )
    elif is_event:
        table_block = (
            f"Event type: {lead.event_type or '—'}\n"
            f"Venue:      {lead.venue or '—'}\n"
            f"Guests:     {lead.covers or '—'}\n"
            f"Date:       {lead.preferred_date or '—'}\n"
        )
    body = (
        "A new enquiry came in via the website.\n\n"
        f"Name:     {lead.name}\n"
        f"Email:    {lead.email}\n"
        f"Phone:    {lead.phone or '—'}\n"
        f"Interest: {lead.get_interest_display()}\n"
        f"Hotel:    {lead.get_hotel_interest_display()}\n"
        f"{table_block}"
        f"Page:     {lead.page or '—'}\n\n"
        f"Message:\n{lead.message or '—'}\n\n"
        "— Reply to this email to respond to the guest directly."
    )
    EmailMessage(
        subject, body, settings.DEFAULT_FROM_EMAIL, recipients, reply_to=[lead.email]
    ).send()


def _acknowledge_guest(lead, dept_label):
    """Auto-acknowledge the guest so they know it's received and who will reply."""
    subject = "We've received your enquiry — Chancery Hotels"
    body = (
        f"Dear {lead.name},\n\n"
        "Thank you for contacting The Chancery Group of Hotels. We've received "
        f"your enquiry and our {dept_label} team will be in touch shortly.\n\n"
        "If your request is urgent, please call the property directly — the "
        "numbers are on our Contact page.\n\n"
        "Warm regards,\n"
        "Chancery Hotels"
    )
    EmailMessage(subject, body, settings.DEFAULT_FROM_EMAIL, [lead.email]).send()


@api_view(["POST"])
def contact_submit(request):
    serializer = LeadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    lead = serializer.save()

    # Route to the right department (with safe fallback) and record where it went.
    recipients, dept_label, _contact = resolve_routing(lead.hotel_interest, lead.interest)
    lead.routed_to = ", ".join(recipients)
    lead.save(update_fields=["routed_to"])

    # Notifications never break the form — the lead is already persisted.
    try:
        _notify_department(lead, recipients, dept_label)
    except Exception:
        pass
    try:
        _acknowledge_guest(lead, dept_label)
    except Exception:
        pass

    return Response({"ok": True}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def newsletter_subscribe(request):
    serializer = NewsletterSubscriberSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    email = serializer.validated_data["email"]
    NewsletterSubscriber.objects.get_or_create(email=email)
    return Response({"ok": True}, status=status.HTTP_201_CREATED)
