from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("hotels", views.HotelViewSet, basename="hotel")
router.register("rooms", views.RoomViewSet, basename="room")
router.register("restaurants", views.RestaurantViewSet, basename="restaurant")
router.register("venues", views.VenueViewSet, basename="venue")
router.register("offers", views.OfferViewSet, basename="offer")
router.register("gallery", views.GalleryViewSet, basename="gallery")
router.register("testimonials", views.TestimonialViewSet, basename="testimonial")

urlpatterns = [
    path("site/", views.site_content, name="site-content"),
    path("faq/", views.faq_list, name="faq-list"),
    path("pages/<str:kind>/", views.page_detail, name="page-by-kind"),
    path("pages/<str:hotel>/<str:kind>/", views.page_detail, name="page-by-hotel-kind"),
    path("", include(router.urls)),
]
