from rest_framework import serializers
from .models import Category, Ticket, Comment, Attachment, CannedResponse, Notification

class CategorySerializer(serializers.ModelSerializer):
    ticket_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'color', 'ticket_count']

    def get_ticket_count(self, obj):
        return obj.tickets.count()

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    author_role = serializers.CharField(source='author.profile.role', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'author', 'author_username', 'author_role', 'body', 'created_at']
        read_only_fields = ['author', 'ticket']

class CannedResponseSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = CannedResponse
        fields = ['id', 'title', 'body', 'created_by', 'created_by_username', 'created_at']
        read_only_fields = ['created_by', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    ticket_title = serializers.CharField(source='ticket.title', read_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'ticket', 'ticket_title', 'notif_type', 'message', 'is_read', 'created_at']
        read_only_fields = fields


MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024  # 10 MB

class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by_username = serializers.CharField(source='uploaded_by.username', read_only=True)
    file_name = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ['id', 'ticket', 'file', 'file_name', 'uploaded_by', 'uploaded_by_username', 'uploaded_at']
        read_only_fields = ['ticket', 'uploaded_by', 'uploaded_at']

    def get_file_name(self, obj):
        return obj.file.name.rsplit('/', 1)[-1] if obj.file else None

    def validate_file(self, value):
        if value.size > MAX_ATTACHMENT_SIZE:
            raise serializers.ValidationError('El archivo no puede superar los 10 MB.')
        return value

class TicketSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    
    # Traer los comentarios y adjuntos anidados en la lectura del detalle
    comments = CommentSerializer(many=True, read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = Ticket
        fields = [
            'id', 'title', 'description', 'status', 'priority', 'resolution_notes',
            'csat_rating', 'csat_comment',
            'created_by', 'created_by_username', 'assigned_to',
            'assigned_to_username', 'category', 'category_name',
            'created_at', 'updated_at', 'comments', 'attachments'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate(self, attrs):
        # Solo exigir nota de resolución cuando esta petición intenta cerrar el ticket
        # (es decir, 'status' viene explícito en el body), no cuando 'closed' es solo
        # el estado heredado del ticket para una actualización parcial de otro campo.
        if attrs.get('status') == 'closed':
            resolution_notes = attrs.get('resolution_notes', getattr(self.instance, 'resolution_notes', None))
            if not (resolution_notes or '').strip():
                raise serializers.ValidationError(
                    {'resolution_notes': 'Debes indicar cómo se resolvió el ticket para poder cerrarlo.'}
                )

        if 'csat_rating' in attrs:
            effective_status = attrs.get('status', getattr(self.instance, 'status', None))
            if effective_status != 'closed':
                raise serializers.ValidationError(
                    {'csat_rating': 'Solo puedes calificar un ticket ya cerrado.'}
                )
            if getattr(self.instance, 'csat_rating', None) is not None:
                raise serializers.ValidationError(
                    {'csat_rating': 'Este ticket ya fue calificado.'}
                )

        return attrs