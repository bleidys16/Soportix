import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DashboardStats {
  total: number;
  open: number;
  in_progress: number;
  closed: number;
  avg_close_days: number | null;
}

export interface CategoryCount {
  id: number;
  name: string;
  count: number;
}

export interface AgentCount {
  agent: string;
  count: number;
}

export interface TicketsTrendPoint {
  day: string;
  count: number;
}

export interface TicketsTrend {
  created: TicketsTrendPoint[];
  closed: TicketsTrendPoint[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  // In-memory cache: evita repetir llamadas HTTP al backend remoto (Neon DB)
  private cache = new Map<string, Observable<any>>();

  constructor(private http: HttpClient) {}

  private cached<T>(key: string, url: string): Observable<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, this.http.get<T>(url).pipe(shareReplay(1)));
    }
    return this.cache.get(key)!;
  }

  /** Invalida toda la caché (llamar tras crear/actualizar/eliminar tickets) */
  invalidate(): void {
    this.cache.clear();
  }

  getStats(): Observable<DashboardStats> {
    return this.cached('stats', `${this.apiUrl}/stats/`);
  }

  getByCategory(): Observable<CategoryCount[]> {
    return this.cached('by-category', `${this.apiUrl}/by-category/`);
  }

  getByAgent(): Observable<AgentCount[]> {
    return this.cached('by-agent', `${this.apiUrl}/by-agent/`);
  }

  getTicketsTrend(): Observable<TicketsTrend> {
    return this.cached('tickets-trend', `${this.apiUrl}/tickets-trend/`);
  }
}
