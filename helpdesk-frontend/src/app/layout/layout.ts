import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth';
import { LogoComponent } from '../core/components/logo/logo';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'ticket' | 'system' | 'user';
}

const MOBILE_BREAKPOINT = '(max-width: 960px)';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TitleCasePipe,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    LogoComponent,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  private breakpointObserver = inject(BreakpointObserver);

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_BREAKPOINT).pipe(map((r) => r.matches)),
    { initialValue: this.breakpointObserver.isMatched(MOBILE_BREAKPOINT) }
  );

  protected readonly mobileMenuOpen = signal(false);

  // Lista interactiva de Notificaciones
  notifications = signal<NotificationItem[]>([
    {
      id: 1,
      title: 'Nuevo Ticket Asignado',
      message: 'Se te ha asignado el ticket #ST081 - Conexión de Red',
      time: 'Hace 10 min',
      read: false,
      type: 'ticket',
    },
    {
      id: 2,
      title: 'Respuesta Recibida',
      message: 'El cliente adjuntó captura de pantalla al ticket #ST082',
      time: 'Hace 1 hora',
      read: false,
      type: 'user',
    },
    {
      id: 3,
      title: 'Mantenimiento del Sistema',
      message: 'Servicio optimizado correctamente en PostgreSQL Neon',
      time: 'Hace 3 horas',
      read: true,
      type: 'system',
    },
  ]);

  unreadCount = computed(() => this.notifications().filter((n) => !n.read).length);

  protected readonly operationItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['admin', 'agent', 'user'] },
    { label: 'Tickets', icon: 'confirmation_number', route: '/tickets', roles: ['admin', 'agent', 'user'] },
    { label: 'Respuestas', icon: 'quickreply', route: '/respuestas', roles: ['admin', 'agent'] },
    { label: 'Reportes', icon: 'bar_chart', route: '/reportes', roles: ['admin', 'agent'] },
  ];

  protected readonly adminItems: NavItem[] = [
    { label: 'Usuarios', icon: 'group', route: '/admin/usuarios', roles: ['admin'] },
    { label: 'Categorías', icon: 'category', route: '/admin/categorias', roles: ['admin'] },
  ];

  protected readonly userRole = computed(() => this.auth.getUserRole());
  protected readonly username = computed(() => this.auth.getUsername());
  protected readonly initials = computed(() => (this.username() ?? '?').slice(0, 2).toUpperCase());

  protected readonly roleLabel: Record<string, string> = {
    user: 'Usuario final',
    agent: 'Agente de soporte',
    admin: 'Administrador',
  };

  protected readonly filteredOperationItems = computed(() =>
    this.operationItems.filter((item) => item.roles.includes(this.userRole() ?? ''))
  );
  protected readonly filteredAdminItems = computed(() =>
    this.adminItems.filter((item) => item.roles.includes(this.userRole() ?? ''))
  );

  constructor(private auth: AuthService) {}

  markAllNotificationsAsRead(): void {
    this.notifications.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  markNotificationAsRead(id: number): void {
    this.notifications.update((list) =>
      list.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  logout(): void {
    this.auth.logout();
  }
}

