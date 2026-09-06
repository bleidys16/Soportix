import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Attachment } from '../models/attachment';

@Injectable({ providedIn: 'root' })
export class AttachmentService {
  private apiUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) {}

  getAll(ticketId: number): Observable<Attachment[]> {
    return this.http.get<Attachment[]>(`${this.apiUrl}/${ticketId}/attachments/`);
  }

  upload(ticketId: number, file: File): Observable<Attachment> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<Attachment>(`${this.apiUrl}/${ticketId}/attachments/`, formData);
  }

  delete(ticketId: number, attachmentId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${ticketId}/attachments/${attachmentId}/`);
  }
}
