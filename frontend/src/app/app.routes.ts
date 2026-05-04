import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/public/home/home').then((m) => m.Home),
    title: 'Inicio - triptoyou',
  },
  {
    path: 'trips',
    loadComponent: () => import('./features/public/home/home').then((m) => m.Home),
    title: 'Catálogo - triptoyou',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
    title: 'Iniciar Sesión - triptoyou',
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register').then((m) => m.Register),
    title: 'Registro - triptoyou',
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Panel de Administración',
  },
  {
    path: 'admin/trips',
    loadComponent: () => import('./features/admin/trips/trip-list/trip-list').then((m) => m.TripList),
    title: 'Gestión de Viajes - triptoyou',
  },
  {
    path: 'admin/trips/new',
    loadComponent: () => import('./features/admin/trips/trip-form/trip-form').then((m) => m.TripForm),
    title: 'Añadir Viaje - triptoyou',
  },
  {
    path: 'admin/trips/edit/:id',
    loadComponent: () => import('./features/admin/trips/trip-form/trip-form').then((m) => m.TripForm),
    title: 'Editar Viaje - triptoyou',
  },
  {
    path: 'trip/:id',
    loadComponent: () =>
      import('./features/public/trip-detail/trip-detail').then((m) => m.TripDetail),
    title: 'Detalles del Viaje',
  },
  {
    path: 'perfil',
    loadComponent: () => import('./features/public/profile/profile').then((m) => m.Profile),
    title: 'Mi Perfil',
  },

  {
    path: 'admin/bookings',
    loadComponent: () =>
      import('./features/admin/bookings/booking-list/booking-list').then((m) => m.BookingList),
    title: 'Gestión de Reservas',
  },

  {
    path: 'pago-completado',
    loadComponent: () =>
      import('./features/public/payment-success/payment-success').then((m) => m.PaymentSuccess),
    title: 'Pago Completado | triptoyou',
  },

  {
    path: 'configuracion',
    loadComponent: () => import('./features/public/settings/settings').then((m) => m.Settings),
    title: 'Configuración | triptoyou',
  },

  {
    path: 'sobre-nosotros',
    loadComponent: () => import('./features/public/pages/about/about').then((m) => m.About),
    title: 'Sobre Nosotros | triptoyou',
  },

  {
    path: 'contacto',
    loadComponent: () => import('./features/public/pages/contact/contact').then((m) => m.Contact),
    title: 'Contacto | triptoyou',
  },

  {
    path: 'privacidad',
    loadComponent: () => import('./features/public/pages/privacy/privacy').then((m) => m.Privacy),
    title: 'Política de Privacidad | triptoyou',
  },

  {
    path: 'terminos',
    loadComponent: () => import('./features/public/pages/terms/terms').then((m) => m.Terms),
    title: 'Términos y Condiciones | triptoyou',
  },

  {
    path: '**',
    redirectTo: '',
  },
];
