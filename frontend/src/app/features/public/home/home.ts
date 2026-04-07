import { Component, inject, OnInit, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TripService } from '../../../core/services/trip';

@Component({
  selector: 'app-home',

  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './home.html',
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class Home implements OnInit {
  private tripService = inject(TripService);

  // Estados del catálogo
  trips = signal<any[]>([]);
  loading = signal<boolean>(true);

  // Variables para la animación suave del avión (Lerp)
  scrollOffsetRaw = signal<number>(0);   // Posición real del scroll
  scrollOffsetLerp = signal<number>(0);  // Posición suavizada
  private lerpFactor = 0.1;              // Velocidad de suavizado

  // Objeto con los filtros del buscador
  filters = {
    destination: '',
    date: '',
    people: null as number | null, 
    price: null as number | null
  };

  constructor() {
    // Iniciamos la animación del avión al cargar el componente
    this.startAnimationLoop();
  }

  ngOnInit() {
    // Al abrir la web por primera vez, cargamos los viajes SIN aplicar filtros (false)
    this.loadTrips(false);
  }

  // Método centralizado para pedir los viajes a Laravel
  private loadTrips(applyFilters: boolean = true) {
    this.loading.set(true);

    // Si applyFilters es true, enviamos This.filters. Si es false, un objeto vacío {}.
    const queryParams = applyFilters ? this.filters : {};

    this.tripService.getTrips(queryParams).subscribe({
      next: (response) => {
        this.trips.set(response.data || response);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar los viajes', err);
        this.loading.set(false);
      }
    });
  }

  // Función que se ejecuta al darle al botón "Buscar"
  onSearch() {
    this.loadTrips(true); // Cargamos CON filtros
    this.scrollToCatalog(); // Hacemos scroll hacia abajo
  }

  // --- LÓGICA DE ANIMACIÓN DEL AVIÓN Y SCROLL ---

  @HostListener('window:scroll')
  onWindowScroll() {
    // Solo guardamos el scroll real, la animación va por su cuenta
    this.scrollOffsetRaw.set(window.scrollY);
  }
  clearFilters() {
    // 1. Vaciamos las variables del formulario
    this.filters = {
      destination: '',
      date: '',
      people: null as number | null,
      price: null as number | null
    };

    // 2. Volvemos a cargar todos los viajes originales (sin filtros)
    this.loadTrips(false);
  }

  private startAnimationLoop() {
    const animate = () => {
      const current = this.scrollOffsetLerp();
      const target = this.scrollOffsetRaw();

      // Fórmula Lerp para que el avión se mueva con suavidad y sin tirones
      const next = current + (target - current) * this.lerpFactor;
      this.scrollOffsetLerp.set(next);

      requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  scrollToCatalog() {
    const catalogElement = document.getElementById('catalogo');
    if (catalogElement) {
      catalogElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}