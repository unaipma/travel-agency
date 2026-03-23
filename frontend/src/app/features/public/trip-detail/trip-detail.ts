import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { TripService } from '../../../core/services/trip';
import { AuthService } from '../../../core/services/auth';
import { BookingService } from '../../../core/services/booking';

@Component({
  selector: 'app-trip-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe],
  templateUrl: './trip-detail.html'
})
export class TripDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  private bookingService = inject(BookingService); // Inyectamos el servicio
  authService = inject(AuthService);

  trip = signal<any>(null);
  loading = signal<boolean>(true);
  activeImage = signal<string>('');
  
  // Signals para el estado de la reserva
  isBooking = signal<boolean>(false);
  bookingSuccess = signal<boolean>(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.tripService.getTrip(id).subscribe({
        next: (response) => {
          const data = response.data || response;
          this.trip.set(data);
          
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

  changeActiveImage(url: string) {
    this.activeImage.set(url);
  }

  // Método que se ejecuta al pulsar el botón "Reservar Ahora"
 onBook() {
    if (!this.trip() || this.isBooking()) return;

    this.isBooking.set(true);
    this.errorMessage.set('');

    // 1. Creamos la reserva en el backend
    this.bookingService.bookTrip(this.trip().id).subscribe({
      next: (response) => {
        // Obtenemos el ID de la reserva recién creada
        const newBookingId = response.booking ? response.booking.id : response.data.id;
        
        // 2. Pedimos la URL de Stripe para esa reserva
        this.bookingService.getCheckoutSession(newBookingId).subscribe({
          next: (stripeResponse) => {
            // 3. Redirigimos al usuario a la pasarela de Stripe
            window.location.href = stripeResponse.url;
          },
          error: (err) => {
            console.error('Error al generar el pago', err);
            this.errorMessage.set('Reserva creada, pero hubo un error al iniciar el pago.');
            this.isBooking.set(false);
          }
        });
      },
      error: (err) => {
        console.error('Error en la reserva', err);
        this.isBooking.set(false);
        if (err.status === 400 || err.error?.message?.includes('ya tienes')) {
          this.errorMessage.set('Ya tienes una reserva activa para este viaje.');
        } else {
          this.errorMessage.set('Hubo un problema al procesar tu reserva.');
        }
      }
    });
  }
}