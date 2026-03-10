import { Routes } from '@angular/router';

// Importación de los componentes generados
import { Home } from './features/public/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/admin/dashboard/dashboard';

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
    path: '**', 
    redirectTo: '' 
  }
];