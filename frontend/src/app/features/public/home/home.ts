import { Component, inject, OnInit, signal, HostListener, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../core/services/trip';

@Component({
  selector: 'app-home',

  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class Home implements OnInit, OnDestroy {
  private animationFrameId: number | null = null;
  private tripService = inject(TripService);

  trips = signal<any[]>([]);
  loading = signal<boolean>(true);

  scrollOffsetRaw = signal<number>(0);
  scrollOffsetLerp = signal<number>(0);
  private lerpFactor = 0.1;

  filters = {
    destination: '',
    date: '',
    people: null as number | null,
    price: null as number | null,
  };
  private startAnimationLoop() {
    const animate = () => {
      const current = this.scrollOffsetLerp();
      const target = this.scrollOffsetRaw();
      const next = current + (target - current) * this.lerpFactor;
      this.scrollOffsetLerp.set(next);

      this.animationFrameId = requestAnimationFrame(animate);
    };
    this.animationFrameId = requestAnimationFrame(animate);
  }

  ngOnDestroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  constructor() {
    this.startAnimationLoop();
  }

  ngOnInit() {
    this.loadTrips(false);
  }

  private loadTrips(applyFilters: boolean = true) {
    this.loading.set(true);

    const queryParams = applyFilters ? this.filters : {};

    this.tripService.getTrips(queryParams).subscribe({
      next: (response) => {
        this.trips.set(response.data || response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar los viajes', err);
        this.loading.set(false);
      },
    });
  }

  onSearch() {
    this.loadTrips(true);
    this.scrollToCatalog();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    this.scrollOffsetRaw.set(window.scrollY);
  }
  clearFilters() {
    this.filters = {
      destination: '',
      date: '',
      people: null as number | null,
      price: null as number | null,
    };

    this.loadTrips(false);
  }

  scrollToCatalog() {
    const catalogElement = document.getElementById('catalogo');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
