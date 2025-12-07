import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../../layout/component/app.floatingconfigurator';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-password-recovery',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    RippleModule,
    AppFloatingConfigurator,
  ],
  templateUrl: './password-recovery.html',
  styleUrl: './password-recovery.css',
})
export class PasswordRecovery {
  email: string = '';
  loading: boolean = false;
  error: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastService: ToastService
  ) {}

  onSubmit(): void {
    // Limpiar error previo
    this.error = '';

    // Validaciones
    if (!this.email || this.email.trim() === '') {
      this.error = 'El correo electrónico es requerido';
      this.toastService.showWarn('Campo requerido', 'Por favor ingrese su correo electrónico');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.error = 'Ingrese un correo electrónico válido';
      this.toastService.showWarn('Correo inválido', 'Por favor ingrese un correo electrónico válido');
      return;
    }

    this.loading = true;
    this.authService.sendPasswordRecovery(this.email.trim()).subscribe({
      next: () => {
        this.loading = false;
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 500);
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Limpiar error cuando el usuario empieza a escribir
  onEmailChange(): void {
    if (this.error) {
      this.error = '';
    }
  }
}
