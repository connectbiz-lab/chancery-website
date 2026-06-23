from rest_framework import serializers

from .models import Lead, NewsletterSubscriber


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            "name", "email", "phone", "interest", "hotel_interest", "message", "page",
            "restaurant", "venue", "event_type", "covers", "preferred_date", "preferred_time",
        ]


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ["email"]
