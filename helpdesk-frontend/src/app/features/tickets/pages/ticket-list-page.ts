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

@Component({
  selector: 'app-ticket-list-page',
  standalone: true,
  imports: [
    DatePipe, TitleCasePipe, FormsModule, RouterLink,
    MatTableModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule, MatTooltipModule,
  ],
  templateUrl: './ticket-list-page.html',
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
    .filters { display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
    .filters mat-form-field { min-width: 150px; }
    .filters .search-field { flex: 1; min-width: 200px; }
    table { width: 100%; }
    .chip { padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 500; text-transform: capitalize; }
    .chip-open { background: #e8f5e9; color: #2e7d32; }
    .chip-in_progress { background: #fff3e0; color: #e65100; }
    .chip-closed { background: #f5f5f5; color: #616161; }
    .chip-low { background: #e8f5e9; color: #2e7d32; }
    .chip-medium { background: #fff3e0; color: #e65100; }
    .chip-high { background: #fbe9e7; color: #c62828; }
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
