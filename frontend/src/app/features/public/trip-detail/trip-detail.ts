import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe, UpperCasePipe } from '@angular/common';
import { TripService } from '../../../core/services/trip';
import { AuthService } from '../../../core/services/auth';
import { BookingService } from '../../../core/services/booking';
import { SafePipe } from '../../../shared/pipes/safe-pipe';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-trip-detail',
  imports: [RouterLink, CurrencyPipe, DatePipe, UpperCasePipe, SafePipe, FormsModule],
  templateUrl: './trip-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TripDetail implements OnInit {
  private route = inject(ActivatedRoute);
  private tripService = inject(TripService);
  private bookingService = inject(BookingService);
  authService = inject(AuthService);

  trip = signal<any>(null);
  loading = signal<boolean>(true);
  activeImage = signal<string>('');

  isBooking = signal<boolean>(false);
  bookingSuccess = signal<boolean>(false);
  errorMessage = signal<string>('');
  hasUserReview = signal<boolean>(false);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    const success = this.route.snapshot.queryParamMap.get('success');

    if (success === 'true') {
      this.bookingSuccess.set(true);
    }

    if (id) {
      this.tripService.getTrip(id).subscribe({
        next: (response) => {
          const data = response.data || response;
          this.trip.set(data);

          const currentUser = this.authService.currentUser();
          if (currentUser && data.reviews) {
            const userReview = data.reviews.find((r: any) => r.user_id === currentUser.id);
            if (userReview) {
              this.hasUserReview.set(true);
              this.reviewRating = userReview.rating;
              this.reviewComment = userReview.comment;
            }
          }

          if (data.images && data.images.length > 0) {
            const cover = data.images.find((img: any) => img.is_cover) || data.images[0];
            this.activeImage.set(cover.image_path);
          }

          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error al cargar los detalles', err);
          this.loading.set(false);
        },
      });
    }
  }

  changeActiveImage(url: string) {
    this.activeImage.set(url);
  }

  onBook() {
    if (!this.trip() || this.isBooking()) return;

    this.isBooking.set(true);
    this.errorMessage.set('');

    this.bookingService.bookTrip(this.trip().id).subscribe({
      next: (response) => {
        const newBookingId = response.booking ? response.booking.id : response.data.id;

        this.bookingService.getCheckoutSession(newBookingId).subscribe({
          next: (stripeResponse) => {
            window.location.href = stripeResponse.url;
          },
          error: (err) => {
            console.error('Error al generar el pago', err);
            this.errorMessage.set('Reserva creada, pero hubo un error al iniciar el pago.');
            this.isBooking.set(false);
          },
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
      },
    });
  }
  reviewRating = 0;
  hoveredStar = 0;
  reviewComment = '';
  isSubmitting = false;

  setRating(val: number) {
    this.reviewRating = val;
  }
  setHover(val: number) {
    this.hoveredStar = val;
  }
  clearHover() {
    this.hoveredStar = 0;
  }

  submitReview() {
    const currentTrip = this.trip();

    if (!currentTrip || this.reviewRating === 0 || this.reviewComment.trim().length < 3) return;

    this.isSubmitting = true;

    this.tripService
      .addReview(currentTrip.id, {
        rating: this.reviewRating,
        comment: this.reviewComment,
      })
      .subscribe({
        next: (response) => {
          this.trip.update((t) => {
            if (!t) return t;

            const reviews = [...(t.reviews || [])];
            const index = reviews.findIndex((r: any) => r.user_id === response.review.user_id);

            if (index !== -1) {
              reviews[index] = response.review;
            } else {
              reviews.unshift(response.review);
              this.hasUserReview.set(true);
            }

            return {
              ...t,
              reviews: reviews,
            };
          });

          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Error al subir reseña', err);
          this.isSubmitting = false;
        },
      });
  }
}
