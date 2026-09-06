from django.urls import path, include
from rest_framework_nested import routers
from .views import CategoryViewSet, TicketViewSet, CommentViewSet, CannedResponseViewSet, AttachmentViewSet

# 1. Configurar el router principal
router = routers.SimpleRouter()
router.register(r'categories', CategoryViewSet, basename='categories')
router.register(r'tickets', TicketViewSet, basename='tickets')
router.register(r'canned-responses', CannedResponseViewSet, basename='canned-responses')

# 2. Configurar el router anidado para los comentarios y adjuntos
tickets_router = routers.NestedSimpleRouter(router, r'tickets', lookup='ticket')
tickets_router.register(r'comments', CommentViewSet, basename='ticket-comments')
tickets_router.register(r'attachments', AttachmentViewSet, basename='ticket-attachments')

# 3. Juntar las rutas en urlpatterns (¡Ojo al nombre, va todo junto!)
urlpatterns = [
    path('', include(router.urls)),
    path('', include(tickets_router.urls)),
]