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

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.loading = true;
    this.authService.sendPasswordRecovery(this.email).subscribe({
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
}
