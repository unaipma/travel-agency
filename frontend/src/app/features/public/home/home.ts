import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
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

  scrollOffset = signal<number>(0);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrollOffset.set(window.scrollY);
  }

  scrollToCatalog() {
    const catalogElement = document.getElementById('catalogo');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

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