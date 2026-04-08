import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin';

@Component({
  selector: 'app-trip-list',

  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './trip-list.html',
})
export class TripList implements OnInit {
  private adminService = inject(AdminService);

  trips = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadTrips();
  }

  loadTrips() {
    this.adminService.getTrips().subscribe({
      next: (response) => {
        this.trips.set(response.data || response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el catálogo del administrador', err);
        this.loading.set(false);
      },
    });
  }

  onDelete(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este viaje de forma permanente?')) {
      this.adminService.deleteTrip(id).subscribe({
        next: () => {
          this.trips.update((currentTrips) => currentTrips.filter((t) => t.id !== id));
        },
        error: (err) => console.error('Error al eliminar el viaje', err),
      });
    }
  }
}
