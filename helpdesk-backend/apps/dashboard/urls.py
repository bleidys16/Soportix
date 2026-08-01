from django.urls import path
from .views import (
    DashboardStatsView,
    DashboardByCategoryView,
    DashboardByAgentView,
    DashboardTicketsTrendView,
)

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('by-category/', DashboardByCategoryView.as_view(), name='dashboard-by-category'),
    path('by-agent/', DashboardByAgentView.as_view(), name='dashboard-by-agent'),
    path('tickets-trend/', DashboardTicketsTrendView.as_view(), name='dashboard-tickets-trend'),
]
