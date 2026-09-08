import { Component, computed, inject, signal, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map } from 'rxjs/operators';
import { AuthService } from '../core/auth/auth';
import { LogoComponent } from '../core/components/logo/logo';
import { NotificationService, AppNotification } from '../core/services/notification.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

const MOBILE_BREAKPOINT = '(max-width: 960px)';

@Component({
  selector: 'app-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TitleCasePipe,
    DatePipe,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    LogoComponent,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout implements OnInit {
  private router = inject(Router);
  private breakpointObserver = inject(BreakpointObserver);
  private notificationService = inject(NotificationService);

  protected readonly isMobile = toSignal(
    this.breakpointObserver.observe(MOBILE_BREAKPOINT).pipe(map((r) => r.matches)),
    { initialValue: this.breakpointObserver.isMatched(MOBILE_BREAKPOINT) }
  );

  protected readonly mobileMenuOpen = signal(false);

  // Header search
  headerSearch = signal('');

  // Notificaciones desde el API real
  notifications = signal<AppNotification[]>([]);
  unreadCount = computed(() => this.notifications().filter((n) => !n.is_read).length);

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

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    this.notificationService.getAll().subscribe({
      next: (list) => this.notifications.set(list),
      error: () => {},
    });
  }

  markAllNotificationsAsRead(): void {
    this.notificationService.markAllRead().subscribe({
      next: () => {
        this.notifications.update((list) => list.map((n) => ({ ...n, is_read: true })));
      },
      error: () => {},
    });
  }

  markNotificationAsRead(id: number): void {
    this.notificationService.markRead(id).subscribe({
      next: () => {
        this.notifications.update((list) =>
          list.map((n) => (n.id === id ? { ...n, is_read: true } : n))
        );
      },
      error: () => {},
    });
  }

  getNotifIcon(n: AppNotification): string {
    const t = n.notification_type ?? '';
    if (t.includes('ticket') || t.includes('assign')) return 'confirmation_number';
    if (t.includes('comment') || t.includes('reply')) return 'person';
    return 'info';
  }

  performSearch(query: string) {
    const q = query.trim();
    if (!q) return;
    this.headerSearch.set('');
    this.router.navigate(['/tickets'], { queryParams: { search: q } });
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
