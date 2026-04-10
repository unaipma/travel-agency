import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = 'http://backend.ddev.site/api';

  sendMessage(message: string, history: any[] = []) {
    return this.http.post<any>(`${this.apiUrl}/chat`, { message, history });
  }
}
