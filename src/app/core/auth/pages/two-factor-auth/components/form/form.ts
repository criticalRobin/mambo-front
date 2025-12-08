import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TwoFactorAuthService } from '../../services/two-factor-auth.service';
import { AuthStorageService } from '../../../../services/auth-storage.service';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
  selector: 'app-two-factor-auth-form',
  imports: [FormsModule, InputTextModule, ButtonModule, CommonModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class TwoFactorAuthForm {
  code: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private twoFactorAuthService: TwoFactorAuthService,
    private authStorageService: AuthStorageService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    // Limpiar error previo
    this.error = '';

    // Validaciones
    if (!this.code || this.code.trim() === '') {
      this.error = 'El código de verificación es requerido';
      this.toastService.showWarn('Código requerido', 'Por favor ingrese el código de verificación');
      return;
    }

    if (this.code.length !== 6) {
      this.error = 'El código debe tener 6 dígitos';
      this.toastService.showWarn('Código inválido', 'El código debe tener exactamente 6 dígitos');
      return;
    }

    if (!/^\d+$/.test(this.code)) {
      this.error = 'El código solo debe contener números';
      this.toastService.showWarn('Código inválido', 'El código solo debe contener números');
      return;
    }

    const data = this.authStorageService.get2FAData();
    if (!data) {
      this.router.navigate(['/auth/login']);
      return;
    }

    this.loading = true;

    this.twoFactorAuthService
      .verify2FA({
        id: data.id,
        email: data.email,
        mfaSecret: data.mfaSecret,
        totp: this.code,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          // Limpiar datos de 2FA
          this.authStorageService.clear2FAData();
          // Pequeño delay para que se vea el toast antes de redirigir
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 500);
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/auth/auth-error']);
        },
      });
  }

  // Limpiar error cuando el usuario empieza a escribir
  onCodeChange(): void {
    if (this.error) {
      this.error = '';
    }
  }
}
