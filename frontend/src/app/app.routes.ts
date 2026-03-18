import { Routes } from '@angular/router';

// Importación de los componentes generados
import { Home } from './features/public/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { TripList } from './features/admin/trips/trip-list/trip-list';
import { TripForm } from './features/admin/trips/trip-form/trip-form';
import { TripDetail } from './features/public/trip-detail/trip-detail';

export const routes: Routes = [
  { 
    path: '', 
    component: Home,
    title: 'Inicio - TravelAgency'
  },
  { 
    path: 'trips', 
    component: Home, 
    title: 'Catálogo - TravelAgency'
  },
  { 
    path: 'login', 
    component: Login,
    title: 'Iniciar Sesión - TravelAgency'
  },
  { 
    path: 'register', 
    component: Register,
    title: 'Registro - TravelAgency'
  },
  { 
    path: 'admin', 
    component: Dashboard,
    title: 'Panel de Administración'
  },
  { 
    path: 'admin/trips', 
    component: TripList,
    title: 'Gestión de Viajes - TravelAgency'
  },
  { 
    path: 'admin/trips/new', 
    component: TripForm,
    title: 'Añadir Viaje - TravelAgency'
  },
  { 
    path: 'admin/trips/edit/:id', 
    component: TripForm,
    title: 'Editar Viaje - TravelAgency'
  },
  { 
    path: 'trip/:id', 
    component: TripDetail,
    title: 'Detalles del Viaje'
  },
  
  { 
    path: '**', 
    redirectTo: '' 
  }
];