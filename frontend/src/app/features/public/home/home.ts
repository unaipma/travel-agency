import { Component, inject, OnInit, signal } from '@angular/core';
import { TripService } from '../../../core/services/trip';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit {
  private tripService = inject(TripService);

  trips = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.tripService.getTrips().subscribe({
      next: (response) => {
        // Laravel devuelve los recursos agrupados en 'data' cuando usamos colecciones
        this.trips.set(response.data || response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar los viajes', err);
        this.loading.set(false);
      }
    });
  }
}