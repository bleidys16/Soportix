import re
import unicodedata

from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import UserProfile


def generate_unique_username(full_name):
    """Deriva un username técnico único (sin espacios) a partir del nombre completo."""
    normalized = unicodedata.normalize('NFKD', full_name).encode('ascii', 'ignore').decode('ascii')
    base = re.sub(r'[^a-zA-Z0-9]+', '.', normalized).strip('.').lower() or 'usuario'
    username = base
    suffix = 1
    while User.objects.filter(username=username).exists():
        suffix += 1
        username = f'{base}{suffix}'
    return username


class RegisterSerializer(serializers.ModelSerializer):
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, required=False, default='user')
    password = serializers.CharField(write_only=True)
    # El usuario ingresa su nombre completo; el username técnico (sin espacios) se genera solo.
    # Para iniciar sesión luego puede usar su email o ese username generado.
    full_name = serializers.CharField(write_only=True)
    username = serializers.CharField(read_only=True)

    class Meta:
        model = User
        fields = ['username', 'full_name', 'email', 'password', 'role']

    def create(self, validated_data):
        role = validated_data.pop('role', 'user')
        full_name = validated_data.pop('full_name').strip()
        first_name, _, last_name = full_name.partition(' ')

        user = User.objects.create_user(
            username=generate_unique_username(full_name),
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name,
        )

        # Creación automática del UserProfile asociado
        UserProfile.objects.create(user=user, role=role)
        return user


class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    ticket_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'is_active', 'ticket_count']

    def get_ticket_count(self, obj):
        return obj.tickets_created.count()


from django.db.models import Q

# Personalizar el JWT para incluir el 'role' en el payload 
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username_or_email = attrs.get(self.username_field)
        if username_or_email:
            user = User.objects.filter(Q(username__iexact=username_or_email) | Q(email__iexact=username_or_email)).first()
            if user:
                attrs[self.username_field] = user.username
        return super().validate(attrs)

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Añadimos el rol del perfil del usuario al token 
        try:
            token['role'] = user.profile.role
        except UserProfile.DoesNotExist:
            token['role'] = 'user'
        return token