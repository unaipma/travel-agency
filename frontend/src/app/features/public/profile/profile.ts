import { Component, inject, OnInit, signal } from '@angular/core';
import { CurrencyPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { BookingService } from '../../../core/services/booking';

@Component({
  selector: 'app-profile',
  imports: [CurrencyPipe, DatePipe, TitleCasePipe, RouterLink],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  private bookingService = inject(BookingService);

  bookings = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadMyBookings();
  }

  loadMyBookings() {
    this.bookingService.getUserBookings().subscribe({
      next: (response) => {
        this.bookings.set(response.data || response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar el historial de reservas', err);
        this.loading.set(false);
      },
    });
  }
}
