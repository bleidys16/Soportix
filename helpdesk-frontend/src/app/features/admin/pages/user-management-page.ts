import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user';
import { AuthService } from '../../../core/auth/auth';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [
    FormsModule, MatTableModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatInputModule,
  ],
  template: `
    <div class="page-header">
      <div>
        <h1>Gestión de usuarios</h1>
        <p class="page-subtitle">Asigna roles y controla el acceso al sistema de soporte.</p>
      </div>
    </div>

    <div class="sx-card">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" class="search-field">
        <mat-icon matPrefix>search</mat-icon>
        <input matInput [ngModel]="searchSignal()" (ngModelChange)="searchSignal.set($event)" placeholder="Buscar por usuario o correo..." />
      </mat-form-field>

      <table mat-table [dataSource]="filteredUsers()">
        <ng-container matColumnDef="username">
          <th mat-header-cell *matHeaderCellDef>Usuario</th>
          <td mat-cell *matCellDef="let u">
            <div class="user-cell">
              <div class="mini-avatar">{{ u.username.slice(0, 2).toUpperCase() }}</div>
              <span>{{ u.username }}</span>
              @if (u.id === auth.getUserId()) { <span class="you-tag">(tú)</span> }
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="email">
          <th mat-header-cell *matHeaderCellDef>Correo</th>
          <td mat-cell *matCellDef="let u">{{ u.email || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="ticket_count">
          <th mat-header-cell *matHeaderCellDef>Tickets</th>
          <td mat-cell *matCellDef="let u">{{ u.ticket_count }}</td>
        </ng-container>

        <ng-container matColumnDef="is_active">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let u">
            <button
              type="button"
              class="status-badge"
              [class.active]="u.is_active"
              [disabled]="u.id === auth.getUserId()"
              (click)="toggleActive(u)"
            >
              {{ u.is_active ? 'Activo' : 'Inactivo' }}
            </button>
          </td>
        </ng-container>

        <ng-container matColumnDef="role">
          <th mat-header-cell *matHeaderCellDef>Rol</th>
          <td mat-cell *matCellDef="let u">
            <mat-form-field appearance="outline" subscriptSizing="dynamic" class="role-field">
              <mat-select [value]="u.role" [disabled]="u.id === auth.getUserId()" (selectionChange)="changeRole(u, $event.value)">
                <mat-option value="admin">Administrador</mat-option>
                <mat-option value="agent">Agente</mat-option>
                <mat-option value="user">Usuario final</mat-option>
              </mat-select>
            </mat-form-field>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

        @if (filteredUsers().length === 0) {
          <tr class="mat-row">
            <td class="mat-cell" [attr.colspan]="displayedColumns.length" style="text-align:center;padding:2rem;">
              No hay usuarios que coincidan.
            </td>
          </tr>
        }
      </table>
    </div>
  `,
  styles: [`
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 500; color: var(--sx-text-primary); }
    .page-subtitle { margin: 4px 0 0; color: var(--sx-text-secondary); font-size: 0.875rem; }

    .sx-card { background: var(--sx-card-bg); border-radius: var(--sx-radius-card); box-shadow: var(--sx-shadow-card); padding: 1.25rem; box-sizing: border-box; }
    .search-field { width: 320px; max-width: 100%; margin-bottom: 1rem; }
    table { width: 100%; }

    .user-cell { display: flex; align-items: center; gap: 8px; }
    .mini-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--sx-primary); color: #fff; font-size: 0.6875rem; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .you-tag { color: var(--sx-text-muted); font-size: 0.75rem; }

    .status-badge { border: none; border-radius: 12px; padding: 3px 12px; font-size: 0.75rem; font-weight: 500; cursor: pointer; background: var(--sx-status-closed-bg); color: var(--sx-status-closed-fg); }
    .status-badge.active { background: var(--sx-status-open-bg); color: var(--sx-status-open-fg); }
    .status-badge:disabled { cursor: not-allowed; opacity: 0.6; }

    .role-field { min-width: 160px; }
  `]
})
export class UserManagementPage implements OnInit {
  private userService = inject(UserService);
  protected auth = inject(AuthService);

  users = signal<User[]>([]);
  searchSignal = signal('');
  displayedColumns = ['username', 'email', 'ticket_count', 'is_active', 'role'];

  filteredUsers = computed(() => {
    const term = this.searchSignal().toLowerCase().trim();
    const list = this.users();
    if (!term) return list;
    return list.filter(
      (u) => u.username.toLowerCase().includes(term) || (u.email ?? '').toLowerCase().includes(term)
    );
  });

  ngOnInit() {
    this.userService.getAll().subscribe((data) => this.users.set(data));
  }

  changeRole(user: User, role: string) {
    this.userService.updateRole(user.id, role).subscribe(() => {
      this.users.update((us) => us.map((u) => (u.id === user.id ? { ...u, role: role as User['role'] } : u)));
    });
  }

  toggleActive(user: User) {
    const next = !user.is_active;
    this.userService.toggleActive(user.id, next).subscribe(() => {
      this.users.update((us) => us.map((u) => (u.id === user.id ? { ...u, is_active: next } : u)));
    });
  }
}
