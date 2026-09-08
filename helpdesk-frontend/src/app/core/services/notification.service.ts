import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AppNotification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  notification_type?: string;
  ticket?: number | null;
  ticket_title?: string | null;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${this.apiUrl}/`);
  }

  getUnreadCount(): Observable<{ unread_count: number }> {
    return this.http.get<{ unread_count: number }>(`${this.apiUrl}/unread_count/`);
  }

  markRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/mark_read/`, {});
  }

  markAllRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/mark_all_read/`, {});
  }
}
