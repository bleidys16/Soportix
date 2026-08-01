import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  template: `
    <h1>Reportes</h1>
    <div class="stats-grid">
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon>confirmation_number</mat-icon>
          <div class="stat-value">{{ total }}</div>
          <div class="stat-label">Total Tickets</div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card open">
        <mat-card-content>
          <mat-icon>radio_button_unchecked</mat-icon>
          <div class="stat-value">{{ open }}</div>
          <div class="stat-label">Abiertos</div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card progress">
        <mat-card-content>
          <mat-icon>pending</mat-icon>
          <div class="stat-value">{{ inProgress }}</div>
          <div class="stat-label">En Proceso</div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card closed">
        <mat-card-content>
          <mat-icon>check_circle</mat-icon>
          <div class="stat-value">{{ closed }}</div>
          <div class="stat-label">Cerrados</div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem; }
    .stat-card { text-align: center; padding: 1rem; }
    .stat-card mat-icon { font-size: 2.5rem; width: 2.5rem; height: 2.5rem; margin-bottom: 0.5rem; }
    .stat-value { font-size: 2rem; font-weight: 500; }
    .stat-label { color: var(--mat-sys-on-surface-variant); font-size: 0.875rem; }
    .stat-card.open mat-icon { color: #4caf50; }
    .stat-card.progress mat-icon { color: #ff9800; }
    .stat-card.closed mat-icon { color: #9e9e9e; }
  `]
})
export class ReportsPage implements OnInit {
  private ticketService = inject(TicketService);

  total = 0;
  open = 0;
  inProgress = 0;
  closed = 0;

  ngOnInit() {
    this.ticketService.getAll().subscribe((tickets) => {
      this.total = tickets.length;
      this.open = tickets.filter((t) => t.status === 'open').length;
      this.inProgress = tickets.filter((t) => t.status === 'in_progress').length;
      this.closed = tickets.filter((t) => t.status === 'closed').length;
    });
  }
}
