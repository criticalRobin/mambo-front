import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TwoFactorAuthService } from '../../services/two-factor-auth.service';
import { AuthStorageService } from '../../../../services/auth-storage.service';

@Component({
  selector: 'app-two-factor-auth-form',
  imports: [FormsModule, InputTextModule, ButtonModule, CommonModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class TwoFactorAuthForm {
  code: string = '';
  loading: boolean = false;

  constructor(
    private twoFactorAuthService: TwoFactorAuthService,
    private authStorageService: AuthStorageService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validaciones
    if (!this.code || this.code.length !== 6 || !/^\d+$/.test(this.code)) {
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
}
