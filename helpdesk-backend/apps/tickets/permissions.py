from rest_framework import permissions

class DenyDemoWrites(permissions.BasePermission):
    """Bloquea cualquier escritura de la cuenta de demostración pública, sin importar su rol."""
    message = 'Esta es una cuenta de demostración de solo lectura. No se permiten cambios.'

    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return not (request.user.is_authenticated and request.user.profile.is_demo)

class IsAdminUser(permissions.BasePermission):
    """Permite el acceso solo a administradores."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role == 'admin'

class IsAgentUser(permissions.BasePermission):
    """Permite el acceso a agentes o administradores."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.profile.role in ['agent', 'admin']

class IsOwnerOrStaff(permissions.BasePermission):
    """
    Permite leer/modificar si eres el creador del ticket, 
    o si eres agente/admin para gestionarlo.
    """
    def has_object_permission(self, request, view, obj):
        if request.user.profile.role in ['admin', 'agent']:
            return True
        return obj.created_by == request.user