import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
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

const MOBILE_BREAKPOINT = '(max-width: 960px)';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TitleCasePipe,
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

  protected readonly operationItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['admin', 'agent', 'user'] },
    { label: 'Tickets', icon: 'confirmation_number', route: '/tickets', roles: ['admin', 'agent', 'user'] },
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
