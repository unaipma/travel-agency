import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../../../core/services/booking';

@Component({
  selector: 'app-payment-success',
  imports: [RouterLink],
  templateUrl: './payment-success.html'
})
export class PaymentSuccess implements OnInit {
  private route = inject(ActivatedRoute);
  private bookingService = inject(BookingService);

  status = signal<'loading' | 'success' | 'error'>('loading');

  ngOnInit() {
    // Capturamos el session_id de la URL
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (sessionId) {
      this.bookingService.verifyPayment(sessionId).subscribe({
        next: () => this.status.set('success'),
        error: () => this.status.set('error')
      });
    } else {
      this.status.set('error');
    }
  }
}