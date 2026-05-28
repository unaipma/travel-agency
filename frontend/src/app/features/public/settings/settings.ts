import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, FormsModule],
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private router = inject(Router);

  loadingProfile = signal<boolean>(false);
  profileMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  loading2FA = signal<boolean>(false);
  twoFactorMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);
  is2faEnabled = signal<boolean>(false);
  qrImage = signal<string | null>(null);
  verificationCode = signal<string>('');

  loadingDelete = signal<boolean>(false);
  confirmDelete = signal<boolean>(false);
  deleteMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.initForm(user);
    }
  }

  private initForm(user: any) {
    this.profileForm.patchValue({
      name: user.name,
      email: user.email,
    });
    this.is2faEnabled.set(!!user.two_factor_enabled);
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) return;
    this.loadingProfile.set(true);
    this.profileMessage.set(null);

    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () => {
        this.loadingProfile.set(false);
        this.profileMessage.set({ text: 'Perfil actualizado correctamente.', type: 'success' });
      },
      error: () => {
        this.loadingProfile.set(false);
        this.profileMessage.set({ text: 'Error al actualizar el perfil.', type: 'error' });
      },
    });
  }

  onEnable2FA() {
    this.loading2FA.set(true);
    this.twoFactorMessage.set(null);

    this.authService.generate2fa().subscribe({
      next: (response) => {
        this.qrImage.set(response.qr_image);
        this.loading2FA.set(false);
      },
      error: (err) => {
        console.error('Error al generar QR', err);
        this.loading2FA.set(false);
        this.twoFactorMessage.set({ text: 'Error al conectar con el servidor para 2FA.', type: 'error' });
      }
    });
  }

  onConfirm2FA() {
    if (this.verificationCode().length !== 6) return;
    
    this.loading2FA.set(true);
    this.twoFactorMessage.set(null);
    
    this.authService.enable2fa(this.verificationCode()).subscribe({
      next: () => {
        this.is2faEnabled.set(true);
        this.qrImage.set(null);
        this.verificationCode.set('');
        this.loading2FA.set(false);
        this.twoFactorMessage.set({ text: '¡Seguridad 2FA activada con éxito!', type: 'success' });
      },
      error: (err) => {
        console.error('Código incorrecto', err);
        this.loading2FA.set(false);
        this.twoFactorMessage.set({ text: 'El código 2FA es incorrecto o ha caducado.', type: 'error' });
      }
    });
  }

  onDisable2FA() {
    if (confirm('¿Estás absolutamente seguro de que quieres quitar la seguridad 2FA de tu cuenta?')) {
      this.loading2FA.set(true);
      this.twoFactorMessage.set(null);
      
      this.authService.disable2fa().subscribe({
        next: () => {
          this.is2faEnabled.set(false);
          this.loading2FA.set(false);
          this.twoFactorMessage.set({ text: 'Seguridad 2FA desactivada.', type: 'success' });
        },
        error: (err) => {
          console.error('Error al desactivar', err);
          this.loading2FA.set(false);
          this.twoFactorMessage.set({ text: 'Error al desactivar 2FA.', type: 'error' });
        }
      });
    }
  }

  onDeleteAccount() {
    if (!this.confirmDelete()) {
      this.deleteMessage.set(null);
      this.confirmDelete.set(true);
      return;
    }

    this.loadingDelete.set(true);
    this.authService.deleteAccount().subscribe({
      next: () => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
        this.authService.currentUser.set(null);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.loadingDelete.set(false);
        this.deleteMessage.set({ text: 'Hubo un error al intentar eliminar la cuenta.', type: 'error' });
      },
    });
  }
}