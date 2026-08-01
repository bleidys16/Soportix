import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth/auth';
import { DashboardService, DashboardStats } from '../../../core/services/dashboard.service';
import { ChartComponent } from '../../../core/components/chart/chart';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatIconModule, MatButtonModule, ChartComponent],
  template: `
    <h1>Dashboard</h1>
    <div class="stats-grid">
      <mat-card class="stat-card">
        <mat-card-content>
          <mat-icon>confirmation_number</mat-icon>
          <div class="stat-value">{{ stats.total }}</div>
          <div class="stat-label">Total Tickets</div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card open">
        <mat-card-content>
          <mat-icon>radio_button_unchecked</mat-icon>
          <div class="stat-value">{{ stats.open }}</div>
          <div class="stat-label">Abiertos</div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card progress">
        <mat-card-content>
          <mat-icon>pending</mat-icon>
          <div class="stat-value">{{ stats.in_progress }}</div>
          <div class="stat-label">En Proceso</div>
        </mat-card-content>
      </mat-card>
      <mat-card class="stat-card closed">
        <mat-card-content>
          <mat-icon>check_circle</mat-icon>
          <div class="stat-value">{{ stats.closed }}</div>
          <div class="stat-label">Cerrados</div>
        </mat-card-content>
      </mat-card>
      @if (stats.avg_close_days !== null) {
        <mat-card class="stat-card avg">
          <mat-card-content>
            <mat-icon>schedule</mat-icon>
            <div class="stat-value">{{ stats.avg_close_days }}</div>
            <div class="stat-label">Promedio cierre (días)</div>
          </mat-card-content>
        </mat-card>
      }
    </div>

    <div class="charts-grid">
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Tickets por Categoría</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <app-chart [type]="'bar'" [labels]="categoryLabels" [data]="categoryData" [label]="'Tickets'" [colors]="categoryColors"></app-chart>
        </mat-card-content>
      </mat-card>
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Distribución de Estados</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <app-chart [type]="'doughnut'" [labels]="statusLabels" [data]="statusData"></app-chart>
        </mat-card-content>
      </mat-card>
      @if (agentData.length) {
        <mat-card class="chart-card">
          <mat-card-header>
            <mat-card-title>Tickets por Agente</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <app-chart [type]="'bar'" [labels]="agentLabels" [data]="agentData" [label]="'Tickets'" [colors]="agentColors" [horizontal]="true"></app-chart>
          </mat-card-content>
        </mat-card>
      }
    </div>

    @if (auth.getUserRole() === 'user') {
      <div class="quick-actions">
        <a mat-raised-button color="primary" routerLink="/tickets/new">Crear Ticket</a>
      </div>
    }
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
    .stat-card.avg mat-icon { color: #3f51b5; }
    .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1rem; margin-top: 2rem; }
    .chart-card { padding: 1rem; }
    .quick-actions { margin-top: 2rem; }
  `]
})
export class DashboardPage implements OnInit {
  protected auth = inject(AuthService);
  private dashboardService = inject(DashboardService);

  stats: DashboardStats = { total: 0, open: 0, in_progress: 0, closed: 0, avg_close_days: null };

  categoryLabels: string[] = [];
  categoryData: number[] = [];
  categoryColors: string[] = [];

  statusLabels = ['Abiertos', 'En Proceso', 'Cerrados'];
  statusData: number[] = [];

  agentLabels: string[] = [];
  agentData: number[] = [];
  agentColors: string[] = [];

  ngOnInit() {
    this.dashboardService.getStats().subscribe((s) => {
      this.stats = s;
      this.statusData = [s.open, s.in_progress, s.closed];
    });

    this.dashboardService.getByCategory().subscribe((cats) => {
      this.categoryLabels = cats.map((c) => c.name);
      this.categoryData = cats.map((c) => c.count);
      this.categoryColors = cats.map((c) => `#${(c.id * 2654435761).toString(16).padStart(6, '0').slice(0, 6)}`);
    });

    this.dashboardService.getByAgent().subscribe((agents) => {
      this.agentLabels = agents.map((a) => a.agent);
      this.agentData = agents.map((a) => a.count);
      this.agentColors = agents.map((_, i) => `hsl(${(i * 47) % 360}, 65%, 50%)`);
    });
  }
}
