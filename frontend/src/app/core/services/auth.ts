import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = 'http://backend.ddev.site/api';

  // Signal reactivo que contiene los datos del usuario o null si no hay sesión
  currentUser = signal<any>(null);

  constructor() {
    // Al recargar la página, comprobamos si ya había un usuario guardado
    const user = localStorage.getItem('user');
    if (user) {
      this.currentUser.set(JSON.parse(user));
    }
  }

  login(credentials: { email: string; password: string }) {
    return this.http.post<any>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          // Actualizamos el Signal, lo que hará que el Navbar cambie al instante
          this.currentUser.set(response.user);
        }
      })
    );
  }

  register(data: any) {
    return this.http.post<any>(`${this.apiUrl}/register`, data);
  }

  logout() {
    // Borramos datos del navegador y reseteamos el Signal
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }
  updateProfile(data: { name: string; email: string }) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put<any>(`${this.apiUrl}/user/profile`, data, { headers });
  }

  deleteAccount() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<any>(`${this.apiUrl}/user`, { headers });
  }

  // Dejamos el método preparado para cuando implementemos el 2FA en Laravel
  enable2FA() {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post<any>(`${this.apiUrl}/user/two-factor-authentication`, {}, { headers });
  }
}