import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  // Las categorías casi no cambian; se cachea la lista para no repetir la
  // misma consulta en cada página que necesita el combo de categorías.
  private cachedAll: Observable<Category[]> | null = null;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Category[]> {
    if (!this.cachedAll) {
      this.cachedAll = this.http.get<Category[]>(`${this.apiUrl}/`).pipe(shareReplay(1));
    }
    return this.cachedAll;
  }

  getById(id: number): Observable<Category> {
    return this.http.get<Category>(`${this.apiUrl}/${id}/`);
  }

  create(data: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/`, data).pipe(tap(() => this.invalidate()));
  }

  update(id: number, data: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/${id}/`, data).pipe(tap(() => this.invalidate()));
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`).pipe(tap(() => this.invalidate()));
  }

  private invalidate(): void {
    this.cachedAll = null;
  }
}
