import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { CommonModule } from '@angular/common';
import { SignUpService } from '../../services/sign-up.service';

@Component({
  selector: 'app-sign-up-form',
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

  constructor(private signUpService: SignUpService, private router: Router) {}

  onSubmit(): void {
    // Validaciones
    if (!this.email || !this.name || !this.lastName || !this.password1 || !this.password2) {
      return;
    }

    if (this.password1 !== this.password2) {
      return;
    }

    if (this.password1.length < 6) {
      return;
    }

    this.loading = true;

    this.signUpService
      .register({
        email: this.email,
        name: this.name,
        lastname: this.lastName,
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
}
