import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TicketService, TicketFilters } from '../../../core/services/ticket.service';
import { Ticket, TicketStatus } from '../../../core/models/ticket';

@Component({
  selector: 'app-agent-ticket-list-page',
  standalone: true,
  imports: [
    DatePipe, TitleCasePipe, FormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule,
  ],
  template: `
    <h1>Panel de Agente - Tickets</h1>

    <div style="display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1rem">
      <mat-form-field appearance="outline" subscriptSizing="dynamic" style="min-width:200px;flex:1">
        <mat-label>Buscar</mat-label>
        <input matInput [(ngModel)]="search" (keyup.enter)="applyFilter()" placeholder="Título" />
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" style="min-width:140px">
        <mat-label>Estado</mat-label>
        <mat-select [(ngModel)]="filterStatus" (selectionChange)="applyFilter()">
          <mat-option value="">Todos</mat-option>
          @for (s of statuses; track s) {
            <mat-option [value]="s">{{ statusLabel[s] }}</mat-option>
          }
        </mat-select>
      </mat-form-field>

      <mat-form-field appearance="outline" subscriptSizing="dynamic" style="min-width:140px">
        <mat-label>Prioridad</mat-label>
        <mat-select [(ngModel)]="filterPriority" (selectionChange)="applyFilter()">
          <mat-option value="">Todas</mat-option>
          <mat-option value="low">Baja</mat-option>
          <mat-option value="medium">Media</mat-option>
          <mat-option value="high">Alta</mat-option>
        </mat-select>
      </mat-form-field>
    </div>

    @if (loading()) {
      <div style="display:flex;justify-content:center;padding:3rem"><mat-spinner diameter="40" /></div>
    } @else {
      <table mat-table [dataSource]="tickets()" class="mat-elevation-z1" style="width:100%">

        <ng-container matColumnDef="id">
          <th mat-header-cell *matHeaderCellDef>#</th>
          <td mat-cell *matCellDef="let t">{{ t.id }}</td>
        </ng-container>

        <ng-container matColumnDef="title">
          <th mat-header-cell *matHeaderCellDef>Título</th>
          <td mat-cell *matCellDef="let t">
            <a [routerLink]="['/agent', t.id]">{{ t.title }}</a>
          </td>
        </ng-container>

        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef>Estado</th>
          <td mat-cell *matCellDef="let t">
            <mat-form-field appearance="outline" subscriptSizing="dynamic" style="min-width:130px" (click)="$event.stopPropagation()">
              <mat-select [value]="t.status" (selectionChange)="changeStatus(t, $event.value)">
                @for (s of statuses; track s) {
                  <mat-option [value]="s">{{ statusLabel[s] }}</mat-option>
                }
              </mat-select>
            </mat-form-field>
          </td>
        </ng-container>

        <ng-container matColumnDef="priority">
          <th mat-header-cell *matHeaderCellDef>Prioridad</th>
          <td mat-cell *matCellDef="let t">{{ t.priority | titlecase }}</td>
        </ng-container>

        <ng-container matColumnDef="created_by_username">
          <th mat-header-cell *matHeaderCellDef>Creado por</th>
          <td mat-cell *matCellDef="let t">{{ t.created_by_username }}</td>
        </ng-container>

        <ng-container matColumnDef="created_at">
          <th mat-header-cell *matHeaderCellDef>Fecha</th>
          <td mat-cell *matCellDef="let t">{{ t.created_at | date:'short' }}</td>
        </ng-container>

        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef></th>
          <td mat-cell *matCellDef="let t">
            <a mat-icon-button [routerLink]="['/agent', t.id]"><mat-icon>visibility</mat-icon></a>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    }
  `,
  styles: [`
    .chip { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; }
  `]
})
export class AgentTicketListPage implements OnInit {
  private ticketService = inject(TicketService);

  tickets = signal<Ticket[]>([]);
  loading = signal(true);
  search = '';
  filterStatus = '';
  filterPriority = '';

  statuses: TicketStatus[] = ['open', 'in_progress', 'closed'];
  statusLabel: Record<TicketStatus, string> = { open: 'Abierto', in_progress: 'En Proceso', closed: 'Cerrado' };
  displayedColumns = ['id', 'title', 'status', 'priority', 'created_by_username', 'created_at', 'actions'];

  ngOnInit() {
    this.loadTickets();
  }

  loadTickets() {
    this.loading.set(true);
    const filters: TicketFilters = {};
    if (this.filterStatus) filters.status = this.filterStatus;
    if (this.filterPriority) filters.priority = this.filterPriority;
    if (this.search) filters.search = this.search;

    this.ticketService.getAll(filters).subscribe((data) => {
      this.tickets.set(data);
      this.loading.set(false);
    });
  }

  applyFilter() { this.loadTickets(); }

  changeStatus(ticket: Ticket, status: TicketStatus) {
    this.ticketService.update(ticket.id, { status }).subscribe(() => this.loadTickets());
  }
}
