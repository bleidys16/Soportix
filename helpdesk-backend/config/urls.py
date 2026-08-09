from django.contrib import admin
from django.urls import path, include
from apps.users.views import UserListView, UserRoleUpdateView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.users.urls')),
    path('api/', include('apps.tickets.urls')),
    path('api/dashboard/', include('apps.dashboard.urls')),
    path('api/users/', UserListView.as_view(), name='user-list'),
    path('api/users/<int:pk>/', UserRoleUpdateView.as_view(), name='user-role-update'),
]