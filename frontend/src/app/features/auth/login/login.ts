import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './login.html',
})
export class Login {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  errorMessage = '';
  show2FA = signal<boolean>(false);
  twoFactorCode = signal<string>('');
  tempEmail = '';

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.getRawValue()).subscribe({
        next: (res) => {
          if (res.two_factor_required) {
            this.show2FA.set(true);
            this.tempEmail = res.email;
            return;
          }
          
          this.handleLoginSuccess(res.user);
        },
        error: (err) => {
          this.errorMessage = 'Credenciales incorrectas o problema de conexión con el servidor.';
        },
      });
    }
  }

  onVerify2FA() {
    if (this.twoFactorCode().length === 6) {
      this.authService.verify2faLogin(this.tempEmail, this.twoFactorCode()).subscribe({
        next: (res) => {
          this.handleLoginSuccess(res.user);
        },
        error: (err) => {
          this.errorMessage = 'Código incorrecto o caducado.';
        }
      });
    }
  }

  private handleLoginSuccess(user: any) {
    if (user.is_admin) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/trips']);
    }
  }
}
