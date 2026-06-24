from rest_framework import serializers
from .models import Category, Ticket, Comment, Attachment

class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

class CommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'ticket', 'author', 'author_username', 'body', 'created_at']
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
            'id', 'title', 'description', 'status', 'priority', 
            'created_by', 'created_by_username', 'assigned_to', 
            'assigned_to_username', 'category', 'category_name', 
            'created_at', 'updated_at', 'comments', 'attachments'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']