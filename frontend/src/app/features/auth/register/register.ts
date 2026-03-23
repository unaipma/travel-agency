import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.html'
})
export class Register {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loading = signal<boolean>(false);
  errorMessage = signal<string>('');

  registerForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', Validators.required]
  });

  onSubmit() {
    if (this.registerForm.invalid) return;
    
    // Validación de contraseñas iguales
    if (this.registerForm.value.password !== this.registerForm.value.password_confirmation) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: (response) => {
        // Si tu backend devuelve el token directamente al registrarse, iniciamos sesión al instante
        if (response.token) {
          localStorage.setItem('auth_token', response.token);
          this.authService.currentUser.set(response.user); // Asegúrate de tener este Signal en tu AuthService
          this.router.navigate(['/']);
        } else {
          // Si tu backend solo crea la cuenta, lo mandamos a que inicie sesión
          this.router.navigate(['/login']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        // Capturar errores de validación de Laravel (ej: "El correo ya está en uso")
        if (err.status === 422 && err.error.errors) {
          const firstError = Object.values(err.error.errors)[0] as string[];
          this.errorMessage.set(firstError[0]);
        } else {
          this.errorMessage.set('Error al conectar con el servidor. Inténtalo de nuevo.');
        }
      }
    });
  }
}