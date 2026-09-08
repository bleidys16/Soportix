from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    color = models.CharField(max_length=20, default='#000000')

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name


class Ticket(models.Model):
    STATUS_CHOICES = [
        ('open', 'Abierto'),
        ('in_progress', 'En Proceso'),
        ('closed', 'Cerrado'),
    ]

    PRIORITY_CHOICES = [
        ('low', 'Baja'),
        ('medium', 'Media'),
        ('high', 'Alta'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='open')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='medium')
    resolution_notes = models.TextField(blank=True, null=True)
    csat_rating = models.PositiveSmallIntegerField(
        blank=True, null=True, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    csat_comment = models.TextField(blank=True, null=True)

    # Relaciones
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tickets_created')
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tickets_assigned')
    category = models.ForeignKey(Category, on_delete=models.PROTECT, related_name='tickets')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"#{self.id} - {self.title} ({self.get_status_display()})"


class Comment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='comments')
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Comentario de {self.author.username} en Ticket #{self.ticket.id}"


class CannedResponse(models.Model):
    title = models.CharField(max_length=100)
    body = models.TextField()
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='canned_responses')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title


class Attachment(models.Model):
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='tickets/attachments/')
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='attachments')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Adjunto para Ticket #{self.ticket.id}"


class Notification(models.Model):
    TYPE_CHOICES = [
        ('comment', 'Nuevo comentario'),
        ('status_change', 'Cambio de estado'),
        ('assignment', 'Asignación'),
    ]

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name='notifications')
    notif_type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Notificación para {self.recipient.username}: {self.message}"
