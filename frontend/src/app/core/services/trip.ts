import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TripService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  getTrips(filters: any = {}) {
    let params = new HttpParams();

    if (filters.destination) params = params.set('destination', filters.destination);
    if (filters.date) params = params.set('date', filters.date);
    if (filters.price) params = params.set('price', filters.price);
    if (filters.people) params = params.set('people', filters.people);

    return this.http.get<any>(`${this.apiUrl}/trips`, { params });
  }

  getTrip(id: string) {
    return this.http.get<any>(`${this.apiUrl}/trips/${id}`);
  }

  addReview(tripId: number, reviewData: { rating: number; comment: string }) {
    const token = localStorage.getItem('auth_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.post<any>(`${this.apiUrl}/trips/${tripId}/reviews`, reviewData, { headers });
  }
}
