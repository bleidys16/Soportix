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
import { MatTooltipModule } from '@angular/material/tooltip';
import { TicketService, TicketFilters } from '../../../core/services/ticket.service';
import { Ticket, TicketStatus, TicketPriority } from '../../../core/models/ticket';
import { AuthService } from '../../../core/auth/auth';
import { StatusBadgeComponent } from '../../../core/components/status-badge/status-badge';
import { PriorityTagComponent } from '../../../core/components/priority-tag/priority-tag';

@Component({
  selector: 'app-ticket-list-page',
  standalone: true,
  imports: [
    DatePipe, TitleCasePipe, FormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
    StatusBadgeComponent, PriorityTagComponent,
  ],
  templateUrl: './ticket-list-page.html',
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 500; color: var(--sx-text-primary); }
    .page-subtitle { margin: 4px 0 0; color: var(--sx-text-secondary); font-size: 0.875rem; }
    .new-ticket-btn { background: var(--sx-primary) !important; color: #fff !important; border-radius: var(--sx-radius-control); }

    .sx-card { background: var(--sx-card-bg); border-radius: var(--sx-radius-card); box-shadow: var(--sx-shadow-card); padding: 1.25rem; box-sizing: border-box; }

    .filters { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .filters mat-form-field { min-width: 150px; }
    .filters .search-field { flex: 1; min-width: 200px; }
    table { width: 100%; }
    .title-link { color: var(--sx-primary); text-decoration: none; font-weight: 500; }
    .title-link:hover { text-decoration: underline; }
    .creator-cell { display: flex; align-items: center; gap: 8px; }
    .mini-avatar { width: 24px; height: 24px; border-radius: 50%; background: var(--sx-primary); color: #fff; font-size: 0.625rem; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .spinner { display: flex; justify-content: center; padding: 3rem; }
  `]
})
export class TicketListPage implements OnInit {
  private ticketService = inject(TicketService);
  protected auth = inject(AuthService);

  tickets = signal<Ticket[]>([]);
  loading = signal(true);

  filters: TicketFilters = { status: '', priority: '', search: '' };
  statuses: TicketStatus[] = ['open', 'in_progress', 'closed'];
  priorities: TicketPriority[] = ['low', 'medium', 'high'];

  displayedColumns = ['id', 'title', 'status', 'priority', 'category_name', 'created_by_username', 'created_at', 'actions'];

  ngOnInit() {
    this.loadTickets();
  }

  pageTitle(): string {
    const role = this.auth.getUserRole();
    if (role === 'agent') return 'Todos los tickets';
    if (role === 'admin') return 'Tickets — vista completa';
    return 'Mis tickets';
  }

  loadTickets() {
    this.loading.set(true);
    const params: TicketFilters = {};
    if (this.filters.status) params.status = this.filters.status;
    if (this.filters.priority) params.priority = this.filters.priority;
    if (this.filters.search) params.search = this.filters.search;

    this.ticketService.getAll(params).subscribe((data) => {
      this.tickets.set(data);
      this.loading.set(false);
    });
  }

  applyFilter() {
    this.loadTickets();
  }
}
