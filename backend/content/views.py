from django.shortcuts import get_object_or_404
from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import (
    FAQSection,
    GalleryImage,
    Hotel,
    Offer,
    Page,
    Restaurant,
    RoomCategory,
    SiteContent,
    Testimonial,
    Venue,
)
from .serializers import (
    FAQSectionSerializer,
    GalleryImageSerializer,
    HotelSerializer,
    OfferSerializer,
    PageSerializer,
    RestaurantSerializer,
    RoomSerializer,
    SiteContentSerializer,
    TestimonialSerializer,
    VenueSerializer,
)


@api_view(["GET"])
def site_content(request):
    obj, _ = SiteContent.objects.get_or_create(pk=1)
    return Response(SiteContentSerializer(obj, context={"request": request}).data)


@api_view(["GET"])
def faq_list(request):
    sections = FAQSection.objects.prefetch_related("items").all()
    return Response(
        FAQSectionSerializer(sections, many=True, context={"request": request}).data
    )


@api_view(["GET"])
def page_detail(request, kind, hotel=None):
    qs = Page.objects.prefetch_related("sections")
    if hotel:
        page = get_object_or_404(qs, kind=kind, hotel__slug=hotel)
    else:
        page = get_object_or_404(qs, kind=kind, hotel__isnull=True)
    return Response(PageSerializer(page, context={"request": request}).data)


class HotelViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Hotel.objects.all()
    serializer_class = HotelSerializer
    lookup_field = "slug"


class RoomViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RoomSerializer

    def get_queryset(self):
        qs = RoomCategory.objects.select_related("hotel").prefetch_related("images")
        hotel = self.request.query_params.get("hotel")
        if hotel:
            qs = qs.filter(hotel__slug=hotel)
        return qs


class RestaurantViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = RestaurantSerializer

    def get_queryset(self):
        qs = Restaurant.objects.select_related("hotel").prefetch_related("images")
        hotel = self.request.query_params.get("hotel")
        if hotel:
            qs = qs.filter(hotel__slug=hotel)
        return qs


class VenueViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = VenueSerializer

    def get_queryset(self):
        qs = Venue.objects.select_related("hotel").prefetch_related("images")
        hotel = self.request.query_params.get("hotel")
        if hotel:
            qs = qs.filter(hotel__slug=hotel)
        return qs


class OfferViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OfferSerializer

    def get_queryset(self):
        qs = Offer.objects.select_related("hotel").all()
        hotel = self.request.query_params.get("hotel")
        if hotel:
            # Hotel-scoped query returns both property-specific AND shared offers.
            qs = qs.filter(hotel__slug=hotel) | qs.filter(hotel__isnull=True)
        return qs.distinct().order_by("order", "title")


class GalleryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = GalleryImageSerializer

    def get_queryset(self):
        qs = GalleryImage.objects.select_related("hotel").all()
        hotel = self.request.query_params.get("hotel")
        if hotel:
            qs = qs.filter(hotel__slug=hotel) | qs.filter(hotel__isnull=True)
        category = self.request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        return qs.distinct().order_by("category", "order")


class TestimonialViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Testimonial.objects.all()
    serializer_class = TestimonialSerializer
