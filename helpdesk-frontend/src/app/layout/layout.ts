import { Component, computed, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../core/auth/auth';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  roles: string[];
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    TitleCasePipe,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.scss',
})
export class Layout {
  protected readonly sidenavOpened = signal(true);

  protected readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/dashboard', roles: ['admin', 'tecnico', 'usuario'] },
    { label: 'Tickets', icon: 'confirmation_number', route: '/tickets', roles: ['admin', 'tecnico', 'usuario'] },
    { label: 'Usuarios', icon: 'people', route: '/admin/usuarios', roles: ['admin'] },
    { label: 'Reportes', icon: 'assessment', route: '/admin/reportes', roles: ['admin', 'tecnico'] },
  ];

  protected readonly userRole = computed(() => this.auth.getUserRole());
  protected readonly filteredNavItems = computed(() =>
    this.navItems.filter((item) => item.roles.includes(this.userRole() ?? ''))
  );

  constructor(private auth: AuthService) {}

  logout(): void {
    this.auth.logout();
  }
}
