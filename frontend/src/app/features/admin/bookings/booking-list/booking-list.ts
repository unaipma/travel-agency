import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AdminService } from '../../../../core/services/admin';

@Component({
  selector: 'app-booking-list',
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './booking-list.html'
})
export class BookingList implements OnInit {
  private adminService = inject(AdminService);

  bookings = signal<any[]>([]);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.loadBookings();
  }

  loadBookings() {
    this.adminService.getAllBookings().subscribe({
      next: (response) => {
        this.bookings.set(response.data || response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las reservas', err);
        this.loading.set(false);
      }
    });
  }

  changeStatus(id: number, newStatus: string) {
    this.adminService.updateBookingStatus(id, newStatus).subscribe({
      next: () => {
        // Actualizamos el Signal localmente para que la UI cambie al instante
        this.bookings.update(currentBookings => 
          currentBookings.map(b => b.id === id ? { ...b, status: newStatus } : b)
        );
      },
      error: (err) => console.error('Error al actualizar el estado', err)
    });
  }
}