import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats/`);
  }

  getByCategory(): Observable<CategoryCount[]> {
    return this.http.get<CategoryCount[]>(`${this.apiUrl}/by-category/`);
  }

  getByAgent(): Observable<AgentCount[]> {
    return this.http.get<AgentCount[]>(`${this.apiUrl}/by-agent/`);
  }

  getTicketsTrend(): Observable<TicketsTrendPoint[]> {
    return this.http.get<TicketsTrendPoint[]>(`${this.apiUrl}/tickets-trend/`);
  }
}
