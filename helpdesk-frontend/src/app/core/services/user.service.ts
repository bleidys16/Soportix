import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user';
import { Paginated } from '../models/paginated';

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /** El listado de usuarios del panel admin es pequeño por naturaleza (empleados,
   *  no clientes), así que se trae en una sola página grande en vez de armar un
   *  paginador en el UI; el backend igual queda protegido por max_page_size. */
  getAll(): Observable<User[]> {
    const params = new HttpParams().set('page_size', 500);
    return this.http
      .get<Paginated<User>>(`${this.apiUrl}/`, { params })
      .pipe(map((res) => res.results));
  }

  updateRole(id: number, role: string): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/`, { role });
  }

  toggleActive(id: number, isActive: boolean): Observable<User> {
    return this.http.patch<User>(`${this.apiUrl}/${id}/`, { is_active: isActive });
  }
}
