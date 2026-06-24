from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Ticket, Comment
from .serializers import CategorySerializer, TicketSerializer, CommentSerializer
from .permissions import IsAdminUser, IsAgentUser, IsOwnerOrStaff

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAdminUser]
        return [permission() for permission in permission_classes]

class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'priority', 'category', 'assigned_to']

    def get_permissions(self):
        if self.action == 'destroy':
            return [IsAdminUser()]
        return [IsAuthenticated(), IsOwnerOrStaff()]

    def get_queryset(self):
        user = self.request.user
        if user.profile.role == 'user':
            return Ticket.objects.filter(created_by=user).order_by('-created_at')
        return Ticket.objects.all().order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(ticket_id=self.kwargs['ticket_pk'])

    def perform_create(self, serializer):
        serializer.save(author=self.request.user, ticket_id=self.kwargs['ticket_pk'])