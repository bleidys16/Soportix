import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth/auth';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';
import { ChartComponent } from '../../../core/components/chart/chart';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../core/models/ticket';
import { StatusBadgeComponent } from '../../../core/components/status-badge/status-badge';
import { PriorityTagComponent } from '../../../core/components/priority-tag/priority-tag';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink, DatePipe, MatIconModule, MatButtonModule, ChartComponent,
    StatusBadgeComponent, PriorityTagComponent,
  ],
  template: `
    <div class="dash-header">
      <div>
        <h1>Dashboard general</h1>
        <p class="dash-subtitle">Estado del servicio de soporte</p>
      </div>
      @if (auth.getUserRole() !== 'admin') {
        <a mat-flat-button class="new-ticket-btn" routerLink="/tickets/new">
          <mat-icon>add</mat-icon> Nuevo ticket
        </a>
      }
    </div>

    <div class="stats-grid">
      <div class="sx-card stat-card">
        <mat-icon class="stat-icon total">confirmation_number</mat-icon>
        <div class="stat-value">{{ stats().total }}</div>
        <div class="stat-label">Total tickets</div>
      </div>
      <div class="sx-card stat-card">
        <mat-icon class="stat-icon open">radio_button_unchecked</mat-icon>
        <div class="stat-value">{{ stats().open }}</div>
        <div class="stat-label">Abiertos</div>
      </div>
      <div class="sx-card stat-card">
        <mat-icon class="stat-icon progress">pending</mat-icon>
        <div class="stat-value">{{ stats().in_progress }}</div>
        <div class="stat-label">En proceso</div>
      </div>
      <div class="sx-card stat-card">
        <mat-icon class="stat-icon closed">check_circle</mat-icon>
        <div class="stat-value">{{ stats().closed }}</div>
        <div class="stat-label">Cerrados</div>
      </div>
      @if (stats().avg_close_days !== null) {
        <div class="sx-card stat-card">
          <mat-icon class="stat-icon avg">schedule</mat-icon>
          <div class="stat-value">{{ stats().avg_close_days }}</div>
          <div class="stat-label">Días prom. de cierre</div>
        </div>
      }
    </div>

    <div class="charts-grid">
      <div class="sx-card chart-card">
        <h3>Tickets por categoría</h3>
        <app-chart [type]="'bar'" [labels]="categoryLabels()" [data]="categoryData()" [label]="'Tickets'" [colors]="categoryColors()"></app-chart>
      </div>
      <div class="sx-card chart-card">
        <h3>Distribución de estados</h3>
        <app-chart [type]="'doughnut'" [labels]="statusLabels" [data]="statusData()"></app-chart>
      </div>
    </div>

    <div class="bottom-grid">
      @if (agentData().length) {
        <div class="sx-card chart-card">
          <h3>Tickets por agente</h3>
          <app-chart [type]="'bar'" [labels]="agentLabels()" [data]="agentData()" [label]="'Tickets'" [colors]="agentColors()" [horizontal]="true"></app-chart>
        </div>
      }

      <div class="sx-card activity-card">
        <div class="activity-header">
          <h3>Actividad reciente</h3>
          <a routerLink="/tickets">Ver todos</a>
        </div>
        @for (t of recentTickets(); track t.id) {
          <a class="activity-row" [routerLink]="['/tickets', t.id]">
            <div class="activity-main">
              <span class="activity-title">{{ t.title }}</span>
              <span class="activity-meta">{{ t.created_by_username }} · {{ t.created_at | date:'short' }}</span>
            </div>
            <div class="activity-badges">
              <app-priority-tag [priority]="t.priority" />
              <app-status-badge [status]="t.status" />
            </div>
          </a>
        } @empty {
          <p class="activity-empty">Sin tickets todavía.</p>
        }
      </div>
    </div>
  `,
  styles: [`
    .dash-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .dash-header h1 { margin: 0; font-size: 1.5rem; font-weight: 500; color: var(--sx-text-primary); }
    .dash-subtitle { margin: 4px 0 0; color: var(--sx-text-secondary); font-size: 0.875rem; }
    .new-ticket-btn { background: var(--sx-primary) !important; color: #fff !important; border-radius: var(--sx-radius-control); }

    .sx-card { background: var(--sx-card-bg); border-radius: var(--sx-radius-card); box-shadow: var(--sx-shadow-card); padding: 1.25rem; box-sizing: border-box; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
    .stat-card { text-align: center; }
    .stat-icon { font-size: 2.25rem; width: 2.25rem; height: 2.25rem; margin-bottom: 0.5rem; }
    .stat-value { font-size: 1.75rem; font-weight: 500; color: var(--sx-text-primary); }
    .stat-label { color: var(--sx-text-secondary); font-size: 0.8125rem; margin-top: 2px; }
    .stat-icon.open { color: var(--sx-status-open-fg); }
    .stat-icon.progress { color: var(--sx-status-progress-fg); }
    .stat-icon.closed { color: var(--sx-status-closed-fg); }
    .stat-icon.total { color: var(--sx-primary); }
    .stat-icon.avg { color: #70a1a9; }

    .charts-grid, .bottom-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1rem; margin-top: 1.5rem; }
    .chart-card h3, .activity-card h3 { margin: 0 0 1rem; font-size: 0.9375rem; font-weight: 500; color: var(--sx-text-primary); }

    .activity-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .activity-header h3 { margin: 0; }
    .activity-header a { font-size: 0.8125rem; color: var(--sx-primary); text-decoration: none; }
    .activity-row { display: flex; justify-content: space-between; align-items: center; gap: 0.75rem; padding: 0.625rem 0; border-top: 1px solid var(--sx-border); text-decoration: none; color: inherit; }
    .activity-row:first-of-type { border-top: none; }
    .activity-main { display: flex; flex-direction: column; min-width: 0; }
    .activity-title { font-size: 0.875rem; color: var(--sx-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .activity-meta { font-size: 0.75rem; color: var(--sx-text-muted); }
    .activity-badges { display: flex; gap: 6px; flex-shrink: 0; }
    .activity-empty { color: var(--sx-text-muted); font-size: 0.875rem; }
  `]
})
export class DashboardPage implements OnInit {
  protected auth = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private ticketService = inject(TicketService);

  stats = signal<DashboardStats>({ total: 0, open: 0, in_progress: 0, closed: 0, avg_close_days: null });

  categoryLabels = signal<string[]>([]);
  categoryData = signal<number[]>([]);
  categoryColors = signal<string[]>([]);

  statusLabels = ['Abiertos', 'En Proceso', 'Cerrados'];
  statusData = signal<number[]>([]);

  agentLabels = signal<string[]>([]);
  agentData = signal<number[]>([]);
  agentColors = signal<string[]>([]);

  recentTickets = signal<Ticket[]>([]);

  ngOnInit() {
    this.dashboardService.getStats().subscribe((s) => {
      this.stats.set(s);
      this.statusData.set([s.open, s.in_progress, s.closed]);
    });

    this.dashboardService.getByCategory().subscribe((cats) => {
      this.categoryLabels.set(cats.map((c) => c.name));
      this.categoryData.set(cats.map((c) => c.count));
      this.categoryColors.set(cats.map((c) => `#${(c.id * 2654435761).toString(16).padStart(6, '0').slice(0, 6)}`));
    });

    this.dashboardService.getByAgent().subscribe((agents) => {
      this.agentLabels.set(agents.map((a) => a.agent));
      this.agentData.set(agents.map((a) => a.count));
      this.agentColors.set(agents.map((_, i) => `hsl(${(i * 47) % 360}, 65%, 50%)`));
    });

    this.ticketService.getAll().subscribe((tickets) => {
      this.recentTickets.set(tickets.slice(0, 5));
    });
  }
}
