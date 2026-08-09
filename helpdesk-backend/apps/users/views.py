from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import UserProfile
from .serializers import RegisterSerializer, UserSerializer, CustomTokenObtainPairSerializer

# Vista personalizada para el Login (asocia nuestro Serializer con rol)
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Vista para el Registro de usuarios
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

# Vista para obtener el perfil del usuario autenticado
class UserMeView(generics.RetrieveAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


# Vista para que el Admin liste todos los usuarios
class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.profile.role != 'admin':
            return Response(status=status.HTTP_403_FORBIDDEN)
        users = User.objects.select_related('profile').all().order_by('username')
        return Response(UserSerializer(users, many=True).data)


# Vista para que el Admin cambie el rol de un usuario
class UserRoleUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        if request.user.profile.role != 'admin':
            return Response(status=status.HTTP_403_FORBIDDEN)
        try:
            user = User.objects.select_related('profile').get(pk=pk)
        except User.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        if user.id == request.user.id:
            return Response(
                {'detail': 'No puedes modificar tu propia cuenta desde aqui.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if 'role' in request.data:
            role = request.data.get('role')
            if role not in dict(UserProfile.ROLE_CHOICES):
                return Response({'detail': 'Rol invalido.'}, status=status.HTTP_400_BAD_REQUEST)
            user.profile.role = role
            user.profile.save()

        if 'is_active' in request.data:
            user.is_active = bool(request.data.get('is_active'))
            user.save()

        user.refresh_from_db()
        return Response(UserSerializer(user).data)