from rest_framework import serializers
from .models import Category, Ticket, Comment, Attachment

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

class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'

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
            'created_by', 'created_by_username', 'assigned_to',
            'assigned_to_username', 'category', 'category_name',
            'created_at', 'updated_at', 'comments', 'attachments'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate(self, attrs):
        status = attrs.get('status', getattr(self.instance, 'status', None))
        resolution_notes = attrs.get('resolution_notes', getattr(self.instance, 'resolution_notes', None))
        if status == 'closed' and not (resolution_notes or '').strip():
            raise serializers.ValidationError(
                {'resolution_notes': 'Debes indicar cómo se resolvió el ticket para poder cerrarlo.'}
            )
        return attrs