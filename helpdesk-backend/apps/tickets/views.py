from django.db.models import ProtectedError
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend

from .models import Category, Ticket, Comment, CannedResponse, Attachment, Notification
from .serializers import (
    CategorySerializer, TicketSerializer, CommentSerializer,
    CannedResponseSerializer, AttachmentSerializer, NotificationSerializer,
)
from .permissions import IsAdminUser, IsAgentUser, IsOwnerOrStaff, DenyDemoWrites
from .notifications import notify_new_comment, notify_status_change, notify_assignment

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [IsAuthenticated, DenyDemoWrites]
        else:
            permission_classes = [IsAdminUser, DenyDemoWrites]
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
            return [IsAdminUser(), DenyDemoWrites()]
        return [IsAuthenticated(), IsOwnerOrStaff(), DenyDemoWrites()]

    def get_queryset(self):
        user = self.request.user
        base = (
            Ticket.objects
            .select_related('category', 'created_by', 'assigned_to')
            .prefetch_related('comments__author__profile', 'attachments__uploaded_by')
        )
        if user.profile.role == 'user':
            return base.filter(created_by=user).order_by('-created_at')
        return base.order_by('-created_at')

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
                if field not in ('status', 'resolution_notes', 'csat_rating', 'csat_comment'):
                    raise PermissionDenied('No tienes permisos para modificar ese campo.')

        ticket = serializer.instance
        old_status = ticket.status
        old_assigned_id = ticket.assigned_to_id
        serializer.save()
        notify_status_change(ticket, user, old_status, ticket.status)
        notify_assignment(ticket, user, old_assigned_id, ticket.assigned_to_id)

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated, DenyDemoWrites]

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
        notify_new_comment(ticket, user)


class CannedResponseViewSet(viewsets.ModelViewSet):
    queryset = CannedResponse.objects.all()
    serializer_class = CannedResponseSerializer
    permission_classes = [IsAgentUser, DenyDemoWrites]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class AttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrStaff, DenyDemoWrites]
    parser_classes = [MultiPartParser, FormParser]
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        return Attachment.objects.filter(ticket_id=self.kwargs['ticket_pk'])

    def get_object(self):
        # Los permisos de objeto se validan contra el ticket dueño del adjunto,
        # no contra el propio Attachment (que no tiene created_by relevante para IsOwnerOrStaff).
        attachment = get_object_or_404(Attachment, pk=self.kwargs['pk'], ticket_id=self.kwargs['ticket_pk'])
        self.check_object_permissions(self.request, attachment.ticket)
        return attachment

    def perform_create(self, serializer):
        ticket = get_object_or_404(Ticket, pk=self.kwargs['ticket_pk'])
        user = self.request.user
        if user.profile.role == 'user' and ticket.created_by != user:
            raise PermissionDenied('Solo puedes adjuntar archivos en tus propios tickets.')
        serializer.save(ticket=ticket, uploaded_by=user)


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated, DenyDemoWrites]

    def get_queryset(self):
        queryset = Notification.objects.filter(recipient=self.request.user)
        if self.action == 'list':
            return queryset[:30]
        return queryset

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({'count': count})

    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=['is_read'])
        return Response(self.get_serializer(notification).data)

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({'status': 'ok'})