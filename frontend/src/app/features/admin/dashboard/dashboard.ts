import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';
import { AdminService } from '../../../core/services/admin';

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, TitleCasePipe],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  private adminService = inject(AdminService);

  stats = signal<any>(null);
  loading = signal<boolean>(true);

  ngOnInit() {
    this.adminService.getDashboardStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las estadísticas del panel', err);
        this.loading.set(false);
      }
    });
  }
}