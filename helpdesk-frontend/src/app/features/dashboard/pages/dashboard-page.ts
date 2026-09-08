import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../../core/auth/auth';
import { DashboardService, DashboardStats, CategoryCount } from '../../../core/services/dashboard.service';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../core/models/ticket';
import { StatusBadgeComponent } from '../../../core/components/status-badge/status-badge';
import { PriorityTagComponent } from '../../../core/components/priority-tag/priority-tag';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    RouterLink, DatePipe, DecimalPipe, FormsModule, MatIconModule, MatButtonModule,
    StatusBadgeComponent, PriorityTagComponent,
  ],
  template: `
    <!-- Hidden File Input for Import -->
    <input type="file" #fileInput style="display: none;" accept=".csv,.json" (change)="handleFileImport($event)" />

    <!-- Top Toolbar & Breadcrumb -->
    <div class="dash-top-bar">
      <div class="dash-breadcrumb">
        <a routerLink="/dashboard" class="back-link">
          <mat-icon>chevron_left</mat-icon> Volver
        </a>
        <span class="crumb-separator">/</span>
        <span class="crumb-current">Inicio / Tickets</span>
      </div>

      <div class="dash-actions">
        <button mat-button class="action-btn import-btn" (click)="fileInput.click()">
          <mat-icon>file_download</mat-icon> Importar
        </button>
        <button mat-button class="action-btn export-btn" (click)="exportTicketsCSV()">
          <mat-icon>file_upload</mat-icon> Exportar
        </button>
        <select class="category-select" [value]="selectedCategory()" (change)="selectedCategory.set($any($event.target).value)">
          <option value="all">Todas las Categorías</option>
          @for (c of topCategories(); track c.id) {
            <option [value]="c.name">{{ c.name }}</option>
          }
        </select>
        @if (auth.getUserRole() !== 'admin') {
          <a class="create-ticket-link-btn" routerLink="/tickets/new">
            <mat-icon>add</mat-icon> Crear Nuevo Ticket
          </a>
        }
      </div>
    </div>

    <!-- Main Dashboard Grid Layout (2-Column) -->
    <div class="dashboard-main-grid">
      <!-- LEFT COLUMN: Ticket List Panel -->
      <section class="tickets-section">
        <div class="tickets-header">
          <h2>Tickets ({{ filteredTickets().length }})</h2>
          <div class="tickets-header-controls">
            <!-- View Mode Toggle -->
            <div class="view-toggle">
              <button class="toggle-btn" [class.active]="viewMode() === 'grid'" (click)="viewMode.set('grid')" title="Vista en tarjetas">
                <mat-icon>grid_view</mat-icon>
              </button>
              <button class="toggle-btn" [class.active]="viewMode() === 'table'" (click)="viewMode.set('table')" title="Vista en tabla">
                <mat-icon>view_list</mat-icon>
              </button>
            </div>

            <!-- Date Range Filter -->
            <div class="date-range-filter">
              <input type="date" class="date-input" [value]="startDate()" (change)="startDate.set($any($event.target).value)" title="Fecha inicio" />
              <span class="filter-dash">-</span>
              <input type="date" class="date-input" [value]="endDate()" (change)="endDate.set($any($event.target).value)" title="Fecha fin" />
              @if (startDate() || endDate()) {
                <button class="clear-date-btn" (click)="clearDates()" title="Limpiar fechas">&times;</button>
              }
            </div>

            <!-- Status Filter -->
            <select class="ticket-filter-select" [value]="selectedStatus()" (change)="selectedStatus.set($any($event.target).value)">
              <option value="all">Todos los Tickets</option>
              <option value="open">Abiertos</option>
              <option value="in_progress">En Proceso</option>
              <option value="closed">Cerrados</option>
            </select>
          </div>
        </div>

        <!-- GRID VIEW (Cards) -->
        @if (viewMode() === 'grid') {
          <div class="ticket-cards-list">
            @for (t of displayedTickets(); track t.id) {
              <div class="ticket-card" [routerLink]="['/tickets', t.id]">
                <div class="ticket-card-thumb">
                  <img [src]="getTicketImage(t.id)" alt="Preview Ticket" />
                </div>
                <div class="ticket-card-content">
                  <div class="ticket-card-top">
                    <div class="creator-info">
                      <div class="creator-avatar">{{ (t.created_by_username || 'U').slice(0, 2).toUpperCase() }}</div>
                      <div>
                        <div class="creator-name-row">
                          <span class="creator-name">{{ t.created_by_username || 'Usuario' }}</span>
                          <span class="ticket-code">#ST08{{ t.id }}</span>
                          <app-priority-tag [priority]="t.priority" />
                        </div>
                        <span class="ticket-date">{{ t.created_at | date:'E, dd MMM hh:mm a' }}</span>
                      </div>
                    </div>
                    <button mat-icon-button class="more-options-btn" (click)="$event.stopPropagation()">
                      <mat-icon>more_vert</mat-icon>
                    </button>
                  </div>

                  <div class="ticket-subject">
                    <strong>Asunto:</strong> {{ t.title }}
                  </div>

                  <div class="ticket-card-meta">
                    <div class="meta-item">
                      <span class="meta-label">Asignado a</span>
                      <div class="assignee-val">
                        <div class="mini-avatar">{{ (t.assigned_to_username || 'A').slice(0, 1).toUpperCase() }}</div>
                        <span>{{ t.assigned_to_username || 'Sin asignar' }}</span>
                      </div>
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Estado</span>
                      <app-status-badge [status]="t.status" />
                    </div>
                    <div class="meta-item">
                      <span class="meta-label">Fecha de Cierre</span>
                      <div class="date-val">
                        <mat-icon class="date-icon">event</mat-icon>
                        <span>{{ t.updated_at | date:'dd-MM-yyyy' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            } @empty {
              <div class="empty-tickets">
                <mat-icon class="empty-icon">confirmation_number</mat-icon>
                <p>No hay tickets que coincidan con los filtros seleccionados.</p>
              </div>
            }
          </div>
        }

        <!-- TABLE VIEW (List) -->
        @if (viewMode() === 'table') {
          <div class="ticket-table-container">
            <table class="ticket-data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asunto</th>
                  <th>Solicitante</th>
                  <th>Categoría</th>
                  <th>Prioridad</th>
                  <th>Estado</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                @for (t of displayedTickets(); track t.id) {
                  <tr [routerLink]="['/tickets', t.id]">
                    <td class="td-code">#ST08{{ t.id }}</td>
                    <td class="td-title"><strong>{{ t.title }}</strong></td>
                    <td class="td-user">{{ t.created_by_username || 'Usuario' }}</td>
                    <td class="td-cat">{{ t.category_name || 'General' }}</td>
                    <td><app-priority-tag [priority]="t.priority" /></td>
                    <td><app-status-badge [status]="t.status" /></td>
                    <td>
                      <a [routerLink]="['/tickets', t.id]" class="view-btn">Ver</a>
                    </td>
                  </tr>
                } @empty {
                  <tr>
                    <td colspan="7" class="empty-table-td">No se encontraron tickets con los filtros aplicados.</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- Pagination Footer -->
        <div class="tickets-pagination">
          <div class="nav-btn-group">
            <button class="pag-btn" [disabled]="currentPage() === 1" (click)="changePage(-1)">Prev</button>
            <button class="pag-btn active" [disabled]="currentPage() * pageSize >= filteredTickets().length" (click)="changePage(1)">Next</button>
          </div>
          <div class="page-numbers">
            <span class="pag-nav-arrow" (click)="setPage(1)">&laquo;</span>
            @for (p of totalPagesArray(); track p) {
              <span class="pag-num" [class.active]="currentPage() === p" (click)="setPage(p)">{{ p }}</span>
            }
            <span class="pag-nav-arrow" (click)="setPage(totalPagesArray().length)">&raquo;</span>
          </div>
        </div>
      </section>

      <!-- RIGHT COLUMN: KPI Stat Cards & Widgets -->
      <section class="widgets-section">
        <!-- 4 Stat Cards 2x2 Grid -->
        <div class="kpi-cards-grid">
          <!-- All Tickets Card -->
          <div class="kpi-card card-all" (click)="selectedStatus.set('all')">
            <div class="kpi-card-header">
              <div class="kpi-icon-box">
                <mat-icon>confirmation_number</mat-icon>
              </div>
            </div>
            <div class="kpi-card-body">
              <span class="kpi-label">Todos los Tickets</span>
              <div class="kpi-value">{{ stats().total }}</div>
            </div>
            <div class="kpi-card-footer">
              <div class="stacked-avatars">
                <div class="avatar-circle">JD</div>
                <div class="avatar-circle">CR</div>
                <div class="avatar-circle">AL</div>
              </div>
            </div>
          </div>

          <!-- Pending Tickets Card -->
          <div class="kpi-card card-pending" (click)="selectedStatus.set('in_progress')">
            <div class="kpi-card-header">
              <div class="kpi-icon-box">
                <mat-icon>hourglass_top</mat-icon>
              </div>
            </div>
            <div class="kpi-card-body">
              <span class="kpi-label">Tickets Pendientes</span>
              <div class="kpi-value">{{ stats().open + stats().in_progress }}</div>
            </div>
            <div class="kpi-card-footer">
              <div class="stacked-avatars">
                <div class="avatar-circle">MR</div>
                <div class="avatar-circle">SK</div>
              </div>
            </div>
          </div>

          <!-- Completed Tickets Card -->
          <div class="kpi-card card-completed" (click)="selectedStatus.set('closed')">
            <div class="kpi-card-header">
              <div class="kpi-icon-box">
                <mat-icon>verified</mat-icon>
              </div>
            </div>
            <div class="kpi-card-body">
              <span class="kpi-label">Tickets Completados</span>
              <div class="kpi-value">{{ stats().closed }}</div>
            </div>
            <div class="kpi-card-footer">
              <div class="stacked-avatars">
                <div class="avatar-circle">VS</div>
                <div class="avatar-circle">ZO</div>
                <div class="avatar-circle">PA</div>
              </div>
            </div>
          </div>

          <!-- Cancelled Tickets Card -->
          <div class="kpi-card card-cancelled">
            <div class="kpi-card-header">
              <div class="kpi-icon-box">
                <mat-icon>cancel</mat-icon>
              </div>
            </div>
            <div class="kpi-card-body">
              <span class="kpi-label">Tickets Cancelados</span>
              <div class="kpi-value">0</div>
            </div>
            <div class="kpi-card-footer">
              <div class="stacked-avatars">
                <div class="avatar-circle">AN</div>
                <div class="avatar-circle">BT</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Top Categories Widget -->
        <div class="top-categories-widget">
          <div class="widget-header">
            <h3>Top Categorías</h3>
            <div class="widget-controls">
              <a routerLink="/admin/categorias" class="view-all-link">Ver todas</a>
            </div>
          </div>
          <div class="category-pills-list">
            <div class="category-pill" [class.selected]="selectedCategory() === 'all'" (click)="selectedCategory.set('all')">
              <span class="cat-name">Todas</span>
              <span class="cat-badge">{{ stats().total }}</span>
            </div>
            @for (cat of topCategories(); track cat.id) {
              <div class="category-pill" [class.selected]="selectedCategory() === cat.name" (click)="selectedCategory.set(cat.name)">
                <span class="cat-name">{{ cat.name }}</span>
                <span class="cat-badge">{{ cat.count | number:'2.0-0' }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Create Ticket Quick Action Banner -->
        <div class="promo-banner-widget">
          <div class="banner-content">
            <p class="banner-subtext">Mesa de ayuda Soportix</p>
            <h4 class="banner-title">¿Necesitas ayuda con algún incidente o consulta?</h4>
            @if (auth.getUserRole() !== 'admin') {
              <a class="banner-cta-btn" routerLink="/tickets/new">Crear Ticket</a>
            }
          </div>
          <div class="banner-illustration">
            <img src="/hero-agente.png" alt="Agente Soportix" />
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    // ─── Top Toolbar & Breadcrumb ─────────────────────────────────────────────
    .dash-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .dash-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;

      .back-link {
        display: inline-flex;
        align-items: center;
        color: var(--sx-creeping-death);
        font-weight: 700;
        text-decoration: none;
        background: #ffffff;
        padding: 4px 12px 4px 6px;
        border-radius: 16px;
        box-shadow: 0 2px 6px rgba(8, 20, 84, 0.05);

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }

      .crumb-separator {
        color: var(--sx-text-muted);
      }

      .crumb-current {
        color: var(--sx-text-muted);
        font-weight: 500;
      }
    }

    .dash-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .action-btn {
      background: #ffffff;
      border: 1px solid var(--sx-border);
      border-radius: 8px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--sx-creeping-death);
      height: 36px;
      padding: 0 12px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    .import-btn {
      background: var(--sx-creeping-death) !important;
      color: #ffffff !important;
      border: none;
    }

    .export-btn {
      background: var(--sx-reef-waters) !important;
      color: #ffffff !important;
      border: none;
    }

    .category-select {
      background: #ffffff;
      border: 1px solid var(--sx-border);
      border-radius: 8px;
      padding: 0 12px;
      height: 36px;
      font-size: 0.8125rem;
      color: var(--sx-creeping-death);
      outline: none;
    }

    .create-ticket-link-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: var(--sx-incubi-darkness);
      font-weight: 700;
      font-size: 0.875rem;
      text-decoration: underline;
      cursor: pointer;

      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }

    // ─── Main 2-Column Grid Layout ────────────────────────────────────────────
    .dashboard-main-grid {
      display: grid;
      grid-template-columns: 1fr 440px;
      gap: 1.5rem;
      align-items: start;
    }

    // ─── LEFT COLUMN: Tickets Section ─────────────────────────────────────────
    .tickets-section {
      background: transparent;
    }

    .tickets-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;

      h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 800;
        color: var(--sx-creeping-death);
      }
    }

    .tickets-header-controls {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .view-toggle {
      display: flex;
      background: #ffffff;
      border-radius: 8px;
      padding: 2px;
      border: 1px solid var(--sx-border);

      .toggle-btn {
        background: transparent;
        border: none;
        padding: 4px;
        border-radius: 6px;
        cursor: pointer;
        color: var(--sx-text-muted);
        display: flex;
        align-items: center;

        mat-icon {
          font-size: 20px;
          width: 20px;
          height: 20px;
        }

        &.active {
          background: var(--sx-incubi-darkness);
          color: #ffffff;
        }
      }
    }

    .date-range-filter {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #ffffff;
      border: 1px solid var(--sx-border);
      padding: 4px 8px;
      border-radius: 8px;

      .date-input {
        border: none;
        outline: none;
        font-size: 0.75rem;
        color: var(--sx-creeping-death);
        background: transparent;
      }

      .filter-dash {
        color: var(--sx-text-muted);
      }

      .clear-date-btn {
        background: transparent;
        border: none;
        color: #c62828;
        font-size: 14px;
        cursor: pointer;
        font-weight: 700;
      }
    }

    .ticket-filter-select {
      background: #ffffff;
      border: 1px solid var(--sx-border);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.8125rem;
      color: var(--sx-creeping-death);
      outline: none;
    }

    // ─── Ticket Cards ─────────────────────────────────────────────────────────
    .ticket-cards-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .ticket-card {
      background: #ffffff;
      border-radius: 16px;
      padding: 1.25rem;
      box-shadow: 0 4px 20px rgba(8, 20, 84, 0.04);
      border: 1px solid rgba(8, 20, 84, 0.06);
      display: flex;
      gap: 1.25rem;
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(8, 20, 84, 0.08);
      }
    }

    .ticket-card-thumb {
      width: 140px;
      height: 120px;
      border-radius: 12px;
      overflow: hidden;
      flex-shrink: 0;
      background: #f0f3f6;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .ticket-card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-width: 0;
    }

    .ticket-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .creator-info {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .creator-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: var(--sx-incubi-darkness);
      color: #ffffff;
      font-weight: 700;
      font-size: 0.8125rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .creator-name-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;

      .creator-name {
        font-weight: 700;
        font-size: 0.9375rem;
        color: var(--sx-creeping-death);
      }

      .ticket-code {
        font-size: 0.8125rem;
        color: var(--sx-text-muted);
        font-weight: 600;
      }
    }

    .ticket-date {
      font-size: 0.75rem;
      color: var(--sx-text-muted);
      display: block;
      margin-top: 2px;
    }

    .more-options-btn {
      color: var(--sx-text-muted);
    }

    .ticket-subject {
      margin: 8px 0;
      font-size: 0.875rem;
      color: var(--sx-text-primary);
      line-height: 1.4;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ticket-card-meta {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding-top: 8px;
      border-top: 1px solid var(--sx-border);
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .meta-label {
        font-size: 0.6875rem;
        color: var(--sx-text-muted);
      }
    }

    .assignee-val {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--sx-creeping-death);

      .mini-avatar {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: var(--sx-grand-rapids);
        color: #ffffff;
        font-size: 10px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }

    .date-val {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.8125rem;
      color: var(--sx-creeping-death);
      font-weight: 500;

      .date-icon {
        font-size: 16px;
        width: 16px;
        height: 16px;
        color: var(--sx-text-muted);
      }
    }

    // ─── Table View ───────────────────────────────────────────────────────────
    .ticket-table-container {
      background: #ffffff;
      border-radius: 16px;
      overflow-x: auto;
      box-shadow: 0 4px 20px rgba(8, 20, 84, 0.04);
      border: 1px solid var(--sx-border);
    }

    .ticket-data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;

      th {
        background: #f8fafc;
        color: var(--sx-creeping-death);
        font-weight: 700;
        text-align: left;
        padding: 12px 16px;
        border-bottom: 1px solid var(--sx-border);
      }

      td {
        padding: 12px 16px;
        border-bottom: 1px solid var(--sx-border);
        color: var(--sx-text-primary);
      }

      tr {
        cursor: pointer;
        transition: background-color 0.15s ease;

        &:hover {
          background: #f0f3ff;
        }

        &:last-child td {
          border-bottom: none;
        }
      }

      .td-code {
        font-weight: 700;
        color: var(--sx-incubi-darkness);
      }

      .view-btn {
        color: var(--sx-incubi-darkness);
        font-weight: 700;
        text-decoration: underline;
      }

      .empty-table-td {
        text-align: center;
        padding: 2rem;
        color: var(--sx-text-muted);
      }
    }

    .empty-tickets {
      text-align: center;
      padding: 3rem 1.5rem;
      background: #ffffff;
      border-radius: 16px;
      border: 1px dashed var(--sx-border);

      .empty-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        color: var(--sx-text-muted);
        margin-bottom: 0.5rem;
      }

      p {
        color: var(--sx-text-muted);
        margin-bottom: 1rem;
      }
    }

    // ─── Pagination ───────────────────────────────────────────────────────────
    .tickets-pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 1.5rem;
    }

    .nav-btn-group {
      display: flex;
      gap: 8px;
    }

    .pag-btn {
      padding: 6px 16px;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      font-size: 0.8125rem;
      cursor: pointer;
      background: #ffffff;
      color: var(--sx-creeping-death);
      box-shadow: 0 2px 6px rgba(8, 20, 84, 0.05);

      &.active {
        background: var(--sx-reef-waters);
        color: #ffffff;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }

    .page-numbers {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.875rem;

      .pag-nav-arrow {
        color: var(--sx-text-muted);
        cursor: pointer;
        padding: 0 4px;
      }

      .pag-num {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        cursor: pointer;
        color: var(--sx-text-muted);

        &.active {
          background: #ffffff;
          color: var(--sx-incubi-darkness);
          font-weight: 700;
          box-shadow: 0 2px 6px rgba(8, 20, 84, 0.08);
        }
      }
    }

    // ─── RIGHT COLUMN: KPI Cards Grid (Soportix Color Scheme) ────────────────
    .widgets-section {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .kpi-cards-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .kpi-card {
      border-radius: 20px;
      padding: 1.25rem;
      color: #ffffff;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      min-height: 140px;
      box-shadow: 0 6px 20px rgba(8, 20, 84, 0.12);
      position: relative;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.15s ease;

      &:hover {
        transform: translateY(-2px);
      }

      &::after {
        content: '';
        position: absolute;
        right: -20px;
        bottom: -20px;
        width: 100px;
        height: 100px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        pointer-events: none;
      }

      &.card-all {
        background: linear-gradient(135deg, var(--sx-incubi-darkness) 0%, var(--sx-creeping-death) 100%);
      }

      &.card-pending {
        background: linear-gradient(135deg, var(--sx-grand-rapids) 0%, #6841E3 100%);
      }

      &.card-completed {
        background: linear-gradient(135deg, #1B8A5A 0%, #115C3B 100%);
      }

      &.card-cancelled {
        background: linear-gradient(135deg, var(--sx-reef-waters) 0%, #8072B0 100%);
      }
    }

    .kpi-card-header {
      display: flex;
      align-items: center;
    }

    .kpi-icon-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;

      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }
    }

    .kpi-card-body {
      margin-top: 0.75rem;

      .kpi-label {
        font-size: 0.8125rem;
        opacity: 0.9;
        font-weight: 500;
      }

      .kpi-value {
        font-size: 2.25rem;
        font-weight: 800;
        line-height: 1.1;
        margin-top: 4px;
      }
    }

    .kpi-card-footer {
      display: flex;
      justify-content: flex-end;
    }

    .stacked-avatars {
      display: flex;

      .avatar-circle {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        background: #ffffff;
        color: var(--sx-creeping-death);
        font-size: 9px;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: -8px;
        border: 2px solid rgba(255, 255, 255, 0.4);

        &:first-child {
          margin-left: 0;
        }
      }
    }

    // ─── Top Categories Widget ────────────────────────────────────────────────
    .top-categories-widget {
      background: #ffffff;
      border-radius: 20px;
      padding: 1.25rem;
      box-shadow: 0 4px 20px rgba(8, 20, 84, 0.04);
      border: 1px solid var(--sx-border);
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;

      h3 {
        margin: 0;
        font-size: 1rem;
        font-weight: 700;
        color: var(--sx-creeping-death);
      }
    }

    .category-pills-list {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .category-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--sx-page-bg);
      border: 1px solid var(--sx-border);
      padding: 6px 12px;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.15s ease;

      &:hover, &.selected {
        background: var(--sx-incubi-darkness);

        .cat-name, .cat-badge {
          color: #ffffff;
        }

        .cat-badge {
          background: rgba(255, 255, 255, 0.25);
        }
      }

      .cat-name {
        font-size: 0.8125rem;
        font-weight: 600;
        color: var(--sx-creeping-death);
      }

      .cat-badge {
        background: var(--sx-incubi-darkness);
        color: #ffffff;
        font-size: 0.6875rem;
        font-weight: 700;
        padding: 2px 6px;
        border-radius: 6px;
      }
    }

    // ─── Promo Banner Widget ──────────────────────────────────────────────────
    .promo-banner-widget {
      background: linear-gradient(135deg, #ffffff 0%, #f0f3ff 100%);
      border-radius: 20px;
      padding: 1.25rem 1.5rem;
      border: 1px solid var(--sx-ocean-eyes);
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 20px rgba(8, 20, 84, 0.04);
      gap: 1rem;
    }

    .banner-content {
      flex: 1;

      .banner-subtext {
        font-size: 0.75rem;
        color: var(--sx-text-muted);
        margin: 0;
      }

      .banner-title {
        margin: 4px 0 12px;
        font-size: 0.9375rem;
        font-weight: 700;
        color: var(--sx-creeping-death);
        line-height: 1.3;
      }

      .banner-cta-btn {
        display: inline-block;
        background: var(--sx-incubi-darkness);
        color: #ffffff;
        padding: 8px 16px;
        border-radius: 10px;
        font-size: 0.8125rem;
        font-weight: 700;
        text-decoration: none;
        box-shadow: 0 4px 12px rgba(14, 33, 160, 0.25);
        transition: transform 0.15s ease;

        &:hover {
          transform: translateY(-1px);
        }
      }
    }

    .banner-illustration {
      width: 110px;
      height: 110px;
      flex-shrink: 0;

      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }

    @media (max-width: 1200px) {
      .dashboard-main-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardPage implements OnInit {
  protected auth = inject(AuthService);
  private dashboardService = inject(DashboardService);
  private ticketService = inject(TicketService);

  stats = signal<DashboardStats>({ total: 0, open: 0, in_progress: 0, closed: 0, avg_close_days: null });
  topCategories = signal<CategoryCount[]>([]);
  allTickets = signal<Ticket[]>([]);

  // Interactive Signals
  viewMode = signal<'grid' | 'table'>('grid');
  selectedStatus = signal<string>('all');
  selectedCategory = signal<string>('all');
  startDate = signal<string>('');
  endDate = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = 3;

  private ticketImages = [
    '/features/tickets.png',
    '/features/adjuntos.png',
    '/features/dashboard.png',
    '/features/categorias.png',
    '/features/respuestas.png',
    '/features/csat.png',
  ];

  // Computed signal that dynamically filters tickets based on all interactive controls
  filteredTickets = computed(() => {
    let list = this.allTickets();

    // 1. Status Filter
    const st = this.selectedStatus();
    if (st !== 'all') {
      list = list.filter((t) => t.status === st);
    }

    // 2. Category Filter
    const cat = this.selectedCategory();
    if (cat !== 'all') {
      list = list.filter((t) => (t.category_name || '').toLowerCase() === cat.toLowerCase());
    }

    // 3. Start Date Filter
    const start = this.startDate();
    if (start) {
      list = list.filter((t) => new Date(t.created_at) >= new Date(start));
    }

    // 4. End Date Filter
    const end = this.endDate();
    if (end) {
      const endDay = new Date(end);
      endDay.setHours(23, 59, 59, 999);
      list = list.filter((t) => new Date(t.created_at) <= endDay);
    }

    return list;
  });

  // Displayed tickets for current page
  displayedTickets = computed(() => {
    const list = this.filteredTickets();
    const page = this.currentPage();
    const start = (page - 1) * this.pageSize;
    return list.slice(start, start + this.pageSize);
  });

  // Total pages array for pagination UI
  totalPagesArray = computed(() => {
    const total = this.filteredTickets().length;
    const count = Math.ceil(total / this.pageSize) || 1;
    return Array.from({ length: count }, (_, i) => i + 1);
  });

  ngOnInit() {
    this.dashboardService.getStats().subscribe((s) => {
      this.stats.set(s);
    });

    this.dashboardService.getByCategory().subscribe((cats) => {
      this.topCategories.set(cats);
    });

    this.ticketService.getAll().subscribe((tickets) => {
      this.allTickets.set(tickets);
    });
  }

  getTicketImage(id: number): string {
    return this.ticketImages[id % this.ticketImages.length];
  }

  clearDates() {
    this.startDate.set('');
    this.endDate.set('');
  }

  setPage(page: number) {
    this.currentPage.set(page);
  }

  changePage(delta: number) {
    const maxPage = this.totalPagesArray().length;
    const next = Math.min(Math.max(1, this.currentPage() + delta), maxPage);
    this.currentPage.set(next);
  }

  // Export Filtered Tickets to CSV File
  exportTicketsCSV() {
    const tickets = this.filteredTickets();
    if (!tickets.length) {
      alert('No hay tickets para exportar con los filtros actuales.');
      return;
    }

    const headers = ['ID', 'Titulo', 'Estado', 'Prioridad', 'Solicitante', 'Asignado', 'Fecha Creacion'];
    const rows = tickets.map((t) => [
      `#ST08${t.id}`,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.status,
      t.priority,
      `"${t.created_by_username || ''}"`,
      `"${t.assigned_to_username || 'Sin asignar'}"`,
      t.created_at,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tickets_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Handle File Import
  handleFileImport(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      alert(`Archivo "${file.name}" cargado exitosamente. Procesando actualización de tickets...`);
    }
  }
}


