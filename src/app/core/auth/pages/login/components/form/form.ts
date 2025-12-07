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
import { ToastService } from '../../../../../../shared/services/toast.service';

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

  // Errores de validación
  errors = {
    email: '',
    password: '',
  };

  constructor(
    private loginService: LoginService,
    private authStorageService: AuthStorageService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    // Limpiar errores previos
    this.clearErrors();

    // Validaciones
    let hasErrors = false;

    if (!this.email || this.email.trim() === '') {
      this.errors.email = 'El correo electrónico es requerido';
      hasErrors = true;
    } else if (!this.isValidEmail(this.email)) {
      this.errors.email = 'Ingrese un correo electrónico válido';
      hasErrors = true;
    }

    if (!this.password || this.password.trim() === '') {
      this.errors.password = 'La contraseña es requerida';
      hasErrors = true;
    }

    if (hasErrors) {
      this.toastService.showWarn('Campos incompletos', 'Por favor complete todos los campos');
      return;
    }

    this.loading = true;

    this.loginService
      .login({
        email: this.email.trim(),
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

  private clearErrors(): void {
    this.errors = {
      email: '',
      password: '',
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Limpiar error cuando el usuario empieza a escribir
  onFieldChange(field: keyof typeof this.errors): void {
    if (this.errors[field]) {
      this.errors[field] = '';
    }
  }
}
