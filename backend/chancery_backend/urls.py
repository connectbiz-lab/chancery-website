from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = "Chancery Hotels Admin"
admin.site.site_title = "Chancery Hotels"
admin.site.index_title = "Site content"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("content.urls")),
    path("api/", include("leads.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
