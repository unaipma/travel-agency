import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private http = inject(HttpClient);
  private apiUrl = 'http://backend.ddev.site/api';

  getTrips() {
    return this.http.get<any>(`${this.apiUrl}/trips`);
  }

  getTrip(id: string) {
    return this.http.get<any>(`${this.apiUrl}/trips/${id}`);
  }
}