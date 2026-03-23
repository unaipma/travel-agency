import { Routes } from '@angular/router';

// Importación de los componentes generados
import { Home } from './features/public/home/home';
import { Login } from './features/auth/login/login';
import { Register } from './features/auth/register/register';
import { Dashboard } from './features/admin/dashboard/dashboard';
import { TripList } from './features/admin/trips/trip-list/trip-list';
import { TripForm } from './features/admin/trips/trip-form/trip-form';
import { TripDetail } from './features/public/trip-detail/trip-detail';
import { Profile } from './features/public/profile/profile';
import { BookingList } from './features/admin/bookings/booking-list/booking-list';
import { PaymentSuccess } from './features/public/payment-success/payment-success';
import { Settings } from './features/public/settings/settings';
import { About } from './features/public/pages/about/about';
import { Contact } from './features/public/pages/contact/contact';
import { Privacy } from './features/public/pages/privacy/privacy';
import { Terms } from './features/public/pages/terms/terms';



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
  path: 'perfil', 
  component: Profile,
  title: 'Mi Perfil'
},


{ 
  path: 'admin/bookings', 
  component: BookingList,
  title: 'Gestión de Reservas'
}, 

{ 
  path: 'pago-completado', 
  component: PaymentSuccess,
  title: 'Pago Completado | triptoyou'
},
 

{ 
  path: 'configuracion', 
  component: Settings,
  title: 'Configuración | triptoyou'
},

{ 
  path: 'sobre-nosotros', 
  component: About,
  title: 'Sobre Nosotros | triptoyou'
},

{ 
  path: 'contacto', 
  component: Contact,
  title: 'Contacto | triptoyou'
},

{ 
  path: 'privacidad',
  component: Privacy,
  title: 'Política de Privacidad | triptoyou'
},

{ 
  path: 'terminos', 
  component: Terms,
  title: 'Términos y Condiciones | triptoyou'
},
  
{ 
  path: '**', 
  redirectTo: '' 
},
  
    
  
  { 
    path: '**', 
    redirectTo: '' 
  }
];