import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private http = inject(HttpClient);
  private apiUrl = 'http://backend.ddev.site/api';

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
}