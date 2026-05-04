import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  currentUser = signal<any>(null);

  constructor() {
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser.set(JSON.parse(user));
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));

          this.currentUser.set(response.user);
        }
      }),
    );
  }

  verify2faLogin(email: string, code: string) {
    return this.http.post<any>(`${this.apiUrl}/2fa/verify-login`, { email, code }).pipe(
      tap((response) => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUser.set(response.user);
        }
      })
    );
  }

  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }
  updateProfile(data: { name: string; email: string }) {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.apiUrl}/user/profile`, data, { headers }).pipe(
      tap((res) => {
        if (res.user) {
          this.currentUser.set(res.user);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  deleteAccount() {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    // Nota: Asegúrate de que esta ruta exista en el backend. 
    // Si no existe, podrías necesitar usar /user con método DELETE.
    return this.http.delete<any>(`${this.apiUrl}/user`, { headers });
  }

  // --- MÉTODOS 2FA ---

  generate2fa() {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/2fa/generate`, {}, { headers });
  }

  enable2fa(code: string) {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/2fa/enable`, { code }, { headers }).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user) {
          const updatedUser = { ...user, two_factor_enabled: true };
          this.currentUser.set(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      })
    );
  }

  disable2fa() {
    const token = this.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/2fa/disable`, {}, { headers }).pipe(
      tap(() => {
        const user = this.currentUser();
        if (user) {
          const updatedUser = { ...user, two_factor_enabled: false };
          this.currentUser.set(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      })
    );
  }
}
