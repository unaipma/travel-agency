import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  sendMessage(message: string, history: any[] = []) {
    return this.http.post<any>(`${this.apiUrl}/chat`, { message, history });
  }
}
