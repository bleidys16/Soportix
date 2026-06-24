from django.db import models
from django.contrib.auth.models import User


class UserProfile(models.Model):
    # Roles permitidos en el sistema
    ROLE_CHOICES = [
        ('admin', 'Administrador'),
        ('agent', 'Agente de Soporte'),
        ('user', 'Usuario Final'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')

    def __str__(self):
        return f"{self.user.username} - {self.get_role_display()}"
