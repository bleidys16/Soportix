from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.tickets.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
]