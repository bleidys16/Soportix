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

  steps = [
    {
      title: 'Creas el ticket',
      text: 'Describes el problema, eliges la categoría y adjuntas capturas si hace falta.',
    },
    {
      title: 'El agente responde',
      text: 'Un agente toma el caso, comenta el avance y actualiza el estado mientras lo resuelve.',
    },
    {
      title: 'Calificas el cierre',
      text: 'Cuando el agente lo cierra, calificas la atención recibida con estrellas.',
    },
  ];

  faqs = [
    {
      question: '¿Necesito tarjeta o registrarme para probarlo?',
      answer: 'No. El botón "Probar demo" te da acceso inmediato con una cuenta de solo lectura, sin formularios.',
    },
    {
      question: '¿La demo puede dañar los datos de ejemplo?',
      answer: 'No. La cuenta demo puede navegar toda la app, pero tiene bloqueada cualquier escritura: no crea, edita ni borra nada.',
    },
    {
      question: '¿Cuántos agentes, usuarios o categorías puedo tener?',
      answer: 'Los que tu equipo necesite. El administrador crea usuarios, asigna roles y define categorías sin límite desde su panel.',
    },
    {
      question: '¿Cualquiera puede ver mis tickets?',
      answer: 'No. Cada usuario ve solo los tickets que creó; los agentes ven los que tienen asignados y el administrador tiene la vista completa.',
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
    this.auth.login({ username: 'demo', password: 'Demo123456' }, false).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.demoLoading.set(false);
        this.demoError.set('No se pudo iniciar la demo. Intenta de nuevo.');
      },
    });
  }
}
