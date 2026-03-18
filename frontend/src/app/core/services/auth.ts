import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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

  logout() {
    // Borramos datos del navegador y reseteamos el Signal
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }
}