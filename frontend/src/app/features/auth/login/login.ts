import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html'
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Definimos el formulario y sus validaciones obligatorias
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMessage = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.getRawValue()).subscribe({
        next: (res) => {
          // Si el login es correcto, redirigimos según su rol
          if (res.user.is_admin) {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/trips']);
          }
        },
        error: (err) => {
          this.errorMessage = 'Credenciales incorrectas o problema de conexión con el servidor.';
        }
      });
    }
  }
}