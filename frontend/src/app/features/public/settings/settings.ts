import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule],
  templateUrl: './settings.html',
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  authService = inject(AuthService);
  private router = inject(Router);

  loadingProfile = signal<boolean>(false);
  profileMessage = signal<{ text: string; type: 'success' | 'error' } | null>(null);

  loading2FA = signal<boolean>(false);

  loadingDelete = signal<boolean>(false);
  confirmDelete = signal<boolean>(false);

  profileForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        email: user.email,
      });
    }
  }

  onUpdateProfile() {
    if (this.profileForm.invalid) return;
    this.loadingProfile.set(true);
    this.profileMessage.set(null);

    this.authService.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: (res) => {
        this.loadingProfile.set(false);
        this.profileMessage.set({ text: 'Perfil actualizado correctamente.', type: 'success' });

        this.authService.currentUser.set(res.user);
      },
      error: () => {
        this.loadingProfile.set(false);
        this.profileMessage.set({ text: 'Error al actualizar el perfil.', type: 'error' });
      },
    });
  }

  onEnable2FA() {
    this.loading2FA.set(true);

    setTimeout(() => {
      alert(
        'La conexión con el backend para el código QR del 2FA se implementará en el siguiente paso.',
      );
      this.loading2FA.set(false);
    }, 1000);
  }

  onDeleteAccount() {
    if (!this.confirmDelete()) {
      this.confirmDelete.set(true);
      return;
    }

    this.loadingDelete.set(true);
    this.authService.deleteAccount().subscribe({
      next: () => {
        localStorage.removeItem('auth_token');
        this.authService.currentUser.set(null);
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error(err);
        this.loadingDelete.set(false);
        alert('Hubo un error al intentar eliminar la cuenta.');
      },
    });
  }
}
