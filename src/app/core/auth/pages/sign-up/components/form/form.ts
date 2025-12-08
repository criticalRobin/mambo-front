import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { SignUpService } from '../../services/sign-up.service';
import { ToastService } from '../../../../../../shared/services/toast.service';

@Component({
  selector: 'app-sign-up-form',
  standalone: true,
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
export class SignUpForm {
  email: string = '';
  name: string = '';
  lastName: string = '';
  password1: string = '';
  password2: string = '';
  loading: boolean = false;

  // Errores de validación
  errors = {
    email: '',
    name: '',
    lastName: '',
    password1: '',
    password2: '',
  };

  constructor(
    private signUpService: SignUpService,
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

    if (!this.name || this.name.trim() === '') {
      this.errors.name = 'El nombre es requerido';
      hasErrors = true;
    }

    if (!this.lastName || this.lastName.trim() === '') {
      this.errors.lastName = 'El apellido es requerido';
      hasErrors = true;
    }

    if (!this.password1 || this.password1.trim() === '') {
      this.errors.password1 = 'La contraseña es requerida';
      hasErrors = true;
    } else if (this.password1.length < 6) {
      this.errors.password1 = 'La contraseña debe tener al menos 6 caracteres';
      hasErrors = true;
    }

    if (!this.password2 || this.password2.trim() === '') {
      this.errors.password2 = 'Debe confirmar la contraseña';
      hasErrors = true;
    } else if (this.password1 !== this.password2) {
      this.errors.password2 = 'Las contraseñas no coinciden';
      hasErrors = true;
    }

    if (hasErrors) {
      this.toastService.showWarn(
        'Campos incompletos',
        'Por favor complete todos los campos correctamente'
      );
      return;
    }

    this.loading = true;

    this.signUpService
      .register({
        email: this.email.trim(),
        name: this.name.trim(),
        lastname: this.lastName.trim(),
        password: this.password1,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          // Pequeño delay para que se vea el toast antes de redirigir
          setTimeout(() => {
            this.router.navigate(['/auth/login']);
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
      name: '',
      lastName: '',
      password1: '',
      password2: '',
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

    // Validar que las contraseñas coincidan en tiempo real
    if (field === 'password1' || field === 'password2') {
      if (this.password1 && this.password2 && this.password1 !== this.password2) {
        this.errors.password2 = 'Las contraseñas no coinciden';
      } else if (this.password1 && this.password2 && this.password1 === this.password2) {
        this.errors.password2 = '';
      }
    }
  }
}
