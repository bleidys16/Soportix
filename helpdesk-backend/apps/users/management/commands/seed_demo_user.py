from django.contrib.auth.models import User
from django.core.management.base import BaseCommand
from apps.users.models import UserProfile
from apps.tickets.models import Category, Ticket, CannedResponse, Comment

DEMO_ACCOUNTS = [
    {
        'username': 'admin',
        'email': 'admin@soportix.com',
        'password': 'Admin123456',
        'role': 'admin',
        'is_demo': False,
        'first_name': 'Administrador',
        'last_name': 'Soportix',
        'is_superuser': True,
        'is_staff': True,
    },
    {
        'username': 'agente',
        'email': 'agente@soportix.com',
        'password': 'Agente123456',
        'role': 'agent',
        'is_demo': False,
        'first_name': 'Agente',
        'last_name': 'Soportix',
        'is_superuser': False,
        'is_staff': False,
    },
    {
        'username': 'usertest',
        'email': 'usertest@soportix.com',
        'password': 'Usertest123456',
        'role': 'user',
        'is_demo': False,
        'first_name': 'Usuario',
        'last_name': 'Test',
        'is_superuser': False,
        'is_staff': False,
    },
    {
        'username': 'demo',
        'email': 'demo@soportix.com',
        'password': 'Demo123456',
        'role': 'user',
        'is_demo': True,
        'first_name': 'Cuenta',
        'last_name': 'Demo',
        'is_superuser': False,
        'is_staff': False,
    },
]


class Command(BaseCommand):
    help = 'Crea (o actualiza) las cuentas de usuario por defecto para pruebas y sus tickets asociados.'

    def handle(self, *args, **options):
        users_map = {}
        for acc in DEMO_ACCOUNTS:
            user, created = User.objects.get_or_create(
                username=acc['username'],
                defaults={
                    'email': acc['email'],
                    'first_name': acc['first_name'],
                    'last_name': acc['last_name'],
                    'is_superuser': acc['is_superuser'],
                    'is_staff': acc['is_staff'],
                },
            )
            user.set_password(acc['password'])
            user.email = acc['email']
            user.is_superuser = acc['is_superuser']
            user.is_staff = acc['is_staff']
            user.save()

            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.role = acc['role']
            profile.is_demo = acc['is_demo']
            profile.save()

            users_map[acc['username']] = user
            action = 'creada' if created else 'actualizada'
            self.stdout.write(
                self.style.SUCCESS(
                    f'Cuenta [{acc["role"].upper()}] {action}: {acc["username"]} / {acc["password"]} ({acc["email"]})'
                )
            )

        cat_software, _ = Category.objects.get_or_create(
            name='Software', defaults={'color': '#3b82f6', 'description': 'Problemas con programas y aplicaciones'}
        )
        cat_hardware, _ = Category.objects.get_or_create(
            name='Hardware', defaults={'color': '#ef4444', 'description': 'Equipos físicos, monitores e impresoras'}
        )
        cat_general, _ = Category.objects.get_or_create(
            name='Soporte General', defaults={'color': '#10b981', 'description': 'Consultas y soporte básico'}
        )

        usertest_user = users_map.get('usertest')
        agente_user = users_map.get('agente')
        demo_user = users_map.get('demo')

        # Limpiar tickets anteriores si tenían datos informales
        Ticket.objects.all().delete()

        if usertest_user:
            t1 = Ticket.objects.create(
                title='Error de autenticación SSO en Google Workspace',
                description='Los usuarios del departamento comercial reciben un error "400 Invalid Scope" al intentar iniciar sesión mediante SSO.',
                status='in_progress',
                priority='high',
                category=cat_software,
                created_by=usertest_user,
                assigned_to=agente_user,
            )
            Comment.objects.create(
                ticket=t1, author=agente_user, body='Hola. Estamos revisando la configuración de OAuth client ID y dominios autorizados.'
            )

            Ticket.objects.create(
                title='Fallo de hardware: Monitor de pantalla secundaria parpadea',
                description='El monitor DisplayPort del puesto 14 presenta parpadeo constante y pérdida ocasional de señal.',
                status='open',
                priority='medium',
                category=cat_hardware,
                created_by=usertest_user,
                assigned_to=None,
            )

            t3 = Ticket.objects.create(
                title='Restablecimiento de contraseña y permisos VPN',
                description='Solicitud de actualización de credenciales de acceso remoto VPN para trabajo híbrido.',
                status='closed',
                priority='low',
                category=cat_general,
                created_by=usertest_user,
                assigned_to=agente_user,
                resolution_notes='Credenciales actualizadas y cliente VPN verificado.',
                csat_rating=5,
                csat_comment='Excelente atención y rápida solución.',
            )
            Comment.objects.create(ticket=t3, author=agente_user, body='Credenciales enviadas a tu correo seguro.')
            Comment.objects.create(ticket=t3, author=usertest_user, body='Confirmado, ya pude conectarme. ¡Muchas gracias!')

        if demo_user:
            t4 = Ticket.objects.create(
                title='Lentitud extrema en módulo de reportes mensuales',
                description='La generación de reportes consolidados en PDF tarda más de 3 minutos o termina con timeout 504 en horas pico.',
                status='in_progress',
                priority='high',
                category=cat_software,
                created_by=demo_user,
                assigned_to=agente_user,
            )
            Comment.objects.create(ticket=t4, author=agente_user, body='El equipo de desarrollo está optimizando las consultas SQL involucradas.')

            t5 = Ticket.objects.create(
                title='Reemplazo de teclado defectuoso en estación 08',
                description='Varias teclas de la fila superior no responden correctamente al escribir.',
                status='closed',
                priority='low',
                category=cat_hardware,
                created_by=demo_user,
                assigned_to=agente_user,
                resolution_notes='Se realizó el cambio físico del periférico por un equipo nuevo.',
                csat_rating=5,
                csat_comment='Cambio realizado el mismo día. Excelente servicio.',
            )
            Comment.objects.create(ticket=t5, author=agente_user, body='Teclado sustituido por modelo corporativo nuevo.')

            Ticket.objects.create(
                title='Configuración de firma de correo corporativo',
                description='Ayuda con la plantilla HTML oficial de la firma institucional para el departamento de Marketing.',
                status='open',
                priority='medium',
                category=cat_general,
                created_by=demo_user,
                assigned_to=None,
            )

        if agente_user:
            CannedResponse.objects.all().delete()
            CannedResponse.objects.create(
                title='Saludo inicial',
                body='Hola, gracias por contactar al equipo de Soportix. Estamos revisando tu caso y te responderemos a la brevedad.',
                created_by=agente_user,
            )
            CannedResponse.objects.create(
                title='Restablecimiento de contraseña',
                body='Hemos restablecido tu contraseña temporalmente. Por favor inicia sesión e ingresa una nueva clave segura.',
                created_by=agente_user,
            )
            CannedResponse.objects.create(
                title='Cierre de ticket',
                body='Tu caso ha sido resuelto satisfactoriamente. Si requieres asistencia adicional, no dudes en abrir un nuevo ticket.',
                created_by=agente_user,
            )

        self.stdout.write(self.style.SUCCESS('Tickets profesionales y respuestas predefinidas instalados con éxito.'))


