from django.conf import settings
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import NewsletterSubscriber
from .serializers import LeadSerializer, NewsletterSubscriberSerializer


@api_view(["POST"])
def contact_submit(request):
    serializer = LeadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    lead = serializer.save()

    subject = f"[Chancery Hotels] New enquiry — {lead.interest}"
    body = (
        f"Name: {lead.name}\n"
        f"Email: {lead.email}\n"
        f"Phone: {lead.phone}\n"
        f"Interest: {lead.get_interest_display()}\n"
        f"Hotel: {lead.get_hotel_interest_display()}\n"
        f"Page: {lead.page}\n\n"
        f"Message:\n{lead.message}\n"
    )
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [settings.DEFAULT_FROM_EMAIL])
    except Exception:
        # Don't break the form because email failed — lead is persisted.
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
