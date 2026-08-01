import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/user';

@Component({
  selector: 'app-user-management-page',
  standalone: true,
  imports: [
    MatTableModule, MatButtonModule, MatIconModule,
    MatSelectModule, MatFormFieldModule, MatCardModule,
  ],
  template: `
    <h1>Gestión de Usuarios</h1>
    <mat-card>
      <mat-card-content>
        <table mat-table [dataSource]="users()" class="mat-elevation-z1">
          <ng-container matColumnDef="id">
            <th mat-header-cell *matHeaderCellDef>#</th>
            <td mat-cell *matCellDef="let u">{{ u.id }}</td>
          </ng-container>

          <ng-container matColumnDef="username">
            <th mat-header-cell *matHeaderCellDef>Usuario</th>
            <td mat-cell *matCellDef="let u">{{ u.username }}</td>
          </ng-container>

          <ng-container matColumnDef="email">
            <th mat-header-cell *matHeaderCellDef>Email</th>
            <td mat-cell *matCellDef="let u">{{ u.email }}</td>
          </ng-container>

          <ng-container matColumnDef="role">
            <th mat-header-cell *matHeaderCellDef>Rol</th>
            <td mat-cell *matCellDef="let u">
              <mat-form-field appearance="outline" subscriptSizing="dynamic" style="min-width:140px">
                <mat-select [value]="u.role" (selectionChange)="changeRole(u, $event.value)">
                  <mat-option value="admin">Administrador</mat-option>
                  <mat-option value="agent">Agente</mat-option>
                  <mat-option value="user">Usuario</mat-option>
                </mat-select>
              </mat-form-field>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    table { width: 100%; }
  `]
})
export class UserManagementPage implements OnInit {
  private userService = inject(UserService);

  users = signal<User[]>([]);
  displayedColumns = ['id', 'username', 'email', 'role'];

  ngOnInit() {
    this.userService.getAll().subscribe((data) => this.users.set(data));
  }

  changeRole(user: User, role: string) {
    this.userService.updateRole(user.id, role).subscribe(() => {
      this.users.update((us) => us.map((u) => (u.id === user.id ? { ...u, role: role as User['role'] } : u)));
    });
  }
}
