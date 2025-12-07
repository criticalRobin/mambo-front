import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { LoginService } from '../../services/login.service';
import { AuthStorageService } from '../../../../services/auth-storage.service';

@Component({
  selector: 'app-login-form',
  imports: [
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    CommonModule,
  ],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class LoginForm {
  email: string = '';
  password: string = '';
  loading: boolean = false;

  constructor(
    private loginService: LoginService,
    private authStorageService: AuthStorageService,
    private router: Router
  ) {}

  onSubmit(): void {
    // Validaciones
    if (!this.email || !this.password) {
      return;
    }

    this.loading = true;

    this.loginService
      .login({
        email: this.email,
        password: this.password,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          // Guardar datos de 2FA en sessionStorage
          this.authStorageService.set2FAData({
            id: response.id,
            email: response.email,
            mfaSecret: response.mfaSecret,
          });
          // Pequeño delay para que se vea el toast antes de redirigir
          setTimeout(() => {
            this.router.navigate(['/auth/2fa']);
          }, 500);
        },
        error: () => {
          this.loading = false;
        },
      });
  }
}
