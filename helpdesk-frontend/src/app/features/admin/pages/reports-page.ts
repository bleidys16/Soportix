import { Component, OnInit, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DashboardService, DashboardStats, TicketsTrend } from '../../../core/services/dashboard.service';
import { TicketService } from '../../../core/services/ticket.service';
import { ChartComponent } from '../../../core/components/chart/chart';

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, ChartComponent],
  template: `
    <div class="page-header">
      <div>
        <h1>Reportes</h1>
        <p class="page-subtitle">Métricas globales del servicio de soporte.</p>
      </div>
      <button mat-flat-button class="export-btn" type="button" (click)="exportCsv()">
        <mat-icon>download</mat-icon> Exportar CSV
      </button>
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

    <div class="sx-card trend-card">
      <h3>Creados vs. cerrados</h3>
      <app-chart [type]="'bar'" [labels]="trendLabels()" [datasets]="trendDatasets()"></app-chart>
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
      @if (agentData().length) {
        <div class="sx-card chart-card">
          <h3>Tickets por agente</h3>
          <app-chart [type]="'bar'" [labels]="agentLabels()" [data]="agentData()" [label]="'Tickets'" [colors]="agentColors()" [horizontal]="true"></app-chart>
        </div>
      }
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
    .page-header h1 { margin: 0; font-size: 1.5rem; font-weight: 500; color: var(--sx-text-primary); }
    .page-subtitle { margin: 4px 0 0; color: var(--sx-text-secondary); font-size: 0.875rem; }
    .export-btn { background: var(--sx-primary) !important; color: #fff !important; border-radius: var(--sx-radius-control); }

    .sx-card { background: var(--sx-card-bg); border-radius: var(--sx-radius-card); box-shadow: var(--sx-shadow-card); padding: 1.25rem; box-sizing: border-box; }

    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
    .stat-card { text-align: center; }
    .stat-icon { font-size: 2.25rem; width: 2.25rem; height: 2.25rem; margin-bottom: 0.5rem; }
    .stat-value { font-size: 1.75rem; font-weight: 500; color: var(--sx-text-primary); }
    .stat-label { color: var(--sx-text-secondary); font-size: 0.8125rem; margin-top: 2px; }
    .stat-icon.open { color: var(--sx-status-open-fg); }
    .stat-icon.progress { color: var(--sx-status-progress-fg); }
    .stat-icon.closed { color: var(--sx-status-closed-fg); }
    .stat-icon.total { color: var(--sx-primary); }
    .stat-icon.avg { color: #70a1a9; }

    .trend-card { margin-bottom: 1.5rem; }
    .trend-card h3, .chart-card h3 { margin: 0 0 1rem; font-size: 0.9375rem; font-weight: 500; color: var(--sx-text-primary); }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 1rem; }
  `]
})
export class ReportsPage implements OnInit {
  private dashboardService = inject(DashboardService);
  private ticketService = inject(TicketService);

  stats = signal<DashboardStats>({ total: 0, open: 0, in_progress: 0, closed: 0, avg_close_days: null });

  trendLabels = signal<string[]>([]);
  trendDatasets = signal<{ label: string; data: number[]; color: string }[]>([]);

  categoryLabels = signal<string[]>([]);
  categoryData = signal<number[]>([]);
  categoryColors = signal<string[]>([]);

  statusLabels = ['Abiertos', 'En Proceso', 'Cerrados'];
  statusData = signal<number[]>([]);

  agentLabels = signal<string[]>([]);
  agentData = signal<number[]>([]);
  agentColors = signal<string[]>([]);

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

    this.dashboardService.getTicketsTrend().subscribe((trend) => this.buildTrend(trend));
  }

  private buildTrend(trend: TicketsTrend) {
    const days = Array.from(new Set([...trend.created.map((p) => p.day), ...trend.closed.map((p) => p.day)])).sort();
    const createdMap = new Map(trend.created.map((p) => [p.day, p.count]));
    const closedMap = new Map(trend.closed.map((p) => [p.day, p.count]));

    this.trendLabels.set(days.map((d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })));
    this.trendDatasets.set([
      { label: 'Creados', data: days.map((d) => createdMap.get(d) ?? 0), color: '#0d454e' },
      { label: 'Cerrados', data: days.map((d) => closedMap.get(d) ?? 0), color: '#22c55e' },
    ]);
  }

  exportCsv() {
    this.ticketService.getAll().subscribe((tickets) => {
      const header = ['ID', 'Título', 'Estado', 'Prioridad', 'Categoría', 'Creado por', 'Asignado a', 'Fecha creación'];
      const rows = tickets.map((t) => [
        t.id,
        t.title,
        t.status,
        t.priority,
        t.category_name ?? '',
        t.created_by_username ?? '',
        t.assigned_to_username ?? '',
        t.created_at,
      ]);
      const csv = [header, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tickets_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }
}
