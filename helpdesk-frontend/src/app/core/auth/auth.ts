import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  username: string;
  password: string;
}

const KEYS = ['access_token', 'refresh_token', 'role', 'username', 'userId'];

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginCredentials, remember = true): Observable<any> {
    const storage = remember ? localStorage : sessionStorage;
    return this.http.post(`${this.apiUrl}/auth/login/`, credentials).pipe(
      tap((response: any) => {
        storage.setItem('access_token', response.access);
        storage.setItem('refresh_token', response.refresh);
      }),
      switchMap(() => this.http.get<{ id: number; role: string; username: string }>(`${this.apiUrl}/auth/me/`)),
      tap((me) => {
        storage.setItem('role', me.role);
        storage.setItem('username', me.username);
        storage.setItem('userId', String(me.id));
      })
    );
  }

  register(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/register/`, data);
  }

  logout(): void {
    KEYS.forEach((k) => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });
    this.router.navigate(['/login']);
  }

  private read(key: string): string | null {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  }

  getToken(): string | null {
    return this.read('access_token');
  }

  getUserRole(): string | null {
    return this.read('role');
  }

  getUsername(): string | null {
    return this.read('username');
  }

  getUserId(): number | null {
    const id = this.read('userId');
    return id ? Number(id) : null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}
