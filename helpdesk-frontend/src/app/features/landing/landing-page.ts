import { AfterViewInit, Component, ElementRef, ViewChild, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../core/auth/auth';
import { LogoComponent } from '../../core/components/logo/logo';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [RouterLink, MatButtonModule, MatIconModule, LogoComponent],
  templateUrl: './landing-page.html',
  styleUrl: './landing-page.scss',
})
export class LandingPage implements AfterViewInit {
  @ViewChild('featuresGrid') featuresGrid?: ElementRef<HTMLElement>;

  demoLoading = signal(false);
  demoError = signal<string | null>(null);

  trustItems = [
    'Gestión de tickets',
    '3 roles de acceso',
    'Dashboard y reportes',
    'Respuestas predefinidas',
    'CSAT',
    'Adjuntos',
  ];

  roles = [
    {
      title: 'Usuario',
      text: 'Crea tickets, da seguimiento a cada caso y califica la atención recibida al cerrarlo.',
    },
    {
      title: 'Agente',
      text: 'Gestiona los tickets asignados, responde con plantillas predefinidas y prioriza lo más urgente.',
    },
    {
      title: 'Administrador',
      text: 'Supervisa reportes, categorías, usuarios y el desempeño general del equipo de soporte.',
    },
  ];

  features = [
    {
      icon: 'confirmation_number',
      image: '/features/tickets.png',
      title: 'Gestión de tickets',
      text: 'Crea, prioriza y da seguimiento a cada ticket desde su apertura hasta su cierre.',
    },
    {
      icon: 'dashboard',
      image: '/features/dashboard.png',
      title: 'Dashboard y reportes',
      text: 'Visualiza el estado del equipo, tiempos de resolución y volumen de tickets en tiempo real.',
    },
    {
      icon: 'category',
      image: '/features/categorias.png',
      title: 'Categorías',
      text: 'Organiza los tickets por categoría para encontrar y priorizar más rápido.',
    },
    {
      icon: 'quickreply',
      image: '/features/respuestas.png',
      title: 'Respuestas predefinidas',
      text: 'Los agentes responden en segundos con plantillas reutilizables para casos frecuentes.',
    },
    {
      icon: 'star',
      image: '/features/csat.png',
      title: 'Satisfacción (CSAT)',
      text: 'Cada ticket cerrado pide una calificación para medir la calidad del soporte.',
    },
    {
      icon: 'attach_file',
      image: '/features/adjuntos.png',
      title: 'Adjuntar archivos',
      text: 'Capturas, documentos y evidencias directamente en la conversación del ticket.',
    },
  ];

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  ngAfterViewInit(): void {
    const cards = this.featuresGrid?.nativeElement.querySelectorAll('.feature-row');
    if (!cards?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    cards.forEach((card) => observer.observe(card));
  }

  tryDemo(): void {
    this.demoError.set(null);
    this.demoLoading.set(true);
    this.auth.login({ username: 'usertest', password: 'Usertest123456' }, false).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.demoLoading.set(false);
        this.demoError.set('No se pudo iniciar la demo. Intenta de nuevo.');
      },
    });
  }
}
