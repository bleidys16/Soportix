from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.exceptions import PermissionDenied
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

    def destroy(self, request, *args, **kwargs):
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            count = self.get_object().tickets.count()
            return Response(
                {'detail': f'No se puede eliminar: tiene {count} ticket(s) asociado(s).'},
                status=status.HTTP_400_BAD_REQUEST,
            )

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
        user = self.request.user
        if user.profile.role == 'admin':
            raise PermissionDenied('Los administradores no pueden crear tickets.')
        serializer.save(created_by=user)

    def perform_update(self, serializer):
        user = self.request.user
        if user.profile.role == 'user':
            data = serializer.validated_data
            if data.get('status') not in (None, 'closed'):
                raise PermissionDenied('Solo puedes marcar tus propios tickets como resueltos.')
            for field in data.keys():
                if field not in ('status', 'resolution_notes'):
                    raise PermissionDenied('No tienes permisos para modificar ese campo.')
        serializer.save()

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = Comment.objects.filter(ticket_id=self.kwargs['ticket_pk'])
        user = self.request.user
        if user.profile.role == 'user':
            qs = qs.filter(ticket__created_by=user)
        return qs

    def perform_create(self, serializer):
        ticket = get_object_or_404(Ticket, pk=self.kwargs['ticket_pk'])
        user = self.request.user
        if user.profile.role == 'user' and ticket.created_by != user:
            raise PermissionDenied('Solo puedes comentar en tus propios tickets.')
        serializer.save(author=user, ticket=ticket)