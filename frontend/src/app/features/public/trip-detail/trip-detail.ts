import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TripService } from '../../../core/services/trip';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-trip-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './trip-detail.html'
})
export class TripDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  authService = inject(AuthService);

  trip = signal<any>(null);
  loading = signal<boolean>(true);
  
  // Signal para controlar la imagen que se muestra en grande en la galería
  activeImage = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tripService.getTrip(id).subscribe({
        next: (response) => {
          const data = response.data || response;
          this.trip.set(data);
          
          // Establecer la portada (o la primera imagen) como imagen activa por defecto
          if (data.images && data.images.length > 0) {
            const cover = data.images.find((img: any) => img.is_cover) || data.images[0];
            this.activeImage.set(cover.image_path);
          }
          
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar los detalles', err);
          this.loading.set(false);
        }
      });
    }
  }

  // Método para cambiar la foto grande al hacer clic en una miniatura
  changeActiveImage(url: string) {
    this.activeImage.set(url);
  }
}