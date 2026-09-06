from django.contrib.auth.models import User
from django.core.management.base import BaseCommand

from apps.users.models import UserProfile

DEMO_USERNAME = 'demo'
DEMO_EMAIL = 'demo@soportix.com'
DEMO_PASSWORD = 'Demo123456'


class Command(BaseCommand):
    help = 'Crea (o actualiza) la cuenta de demostración pública de solo lectura usada por el botón "Probar demo".'

    def handle(self, *args, **options):
        user, created = User.objects.get_or_create(
            username=DEMO_USERNAME,
            defaults={'email': DEMO_EMAIL, 'first_name': 'Cuenta', 'last_name': 'Demo'},
        )
        user.set_password(DEMO_PASSWORD)
        user.email = DEMO_EMAIL
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'user'
        profile.is_demo = True
        profile.save()

        action = 'creada' if created else 'actualizada'
        self.stdout.write(self.style.SUCCESS(f'Cuenta demo {action}: {DEMO_USERNAME} / {DEMO_PASSWORD}'))
