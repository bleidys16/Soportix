import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CannedResponse } from '../models/canned-response';

@Injectable({ providedIn: 'root' })
export class CannedResponseService {
  private apiUrl = `${environment.apiUrl}/canned-responses`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<CannedResponse[]> {
    return this.http.get<CannedResponse[]>(`${this.apiUrl}/`);
  }

  create(data: Partial<CannedResponse>): Observable<CannedResponse> {
    return this.http.post<CannedResponse>(`${this.apiUrl}/`, data);
  }

  update(id: number, data: Partial<CannedResponse>): Observable<CannedResponse> {
    return this.http.put<CannedResponse>(`${this.apiUrl}/${id}/`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}
