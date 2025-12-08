import { Component } from '@angular/core';
import { AppFloatingConfigurator } from '../../../../layout/component/app.floatingconfigurator';
import { RouterModule, Router } from '@angular/router';
import { AuthStorageService } from '../../services/auth-storage.service';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-auth-error',
  imports: [AppFloatingConfigurator, RouterModule, ButtonModule],
  templateUrl: './auth-error.html',
  styleUrl: './auth-error.css',
})
export class AuthError {
  constructor(private router: Router, private authStorageService: AuthStorageService) {}

  onGoToLogin(): void {
    // Limpiar datos de 2FA del sessionStorage
    this.authStorageService.clear2FAData();
    // Redirigir al login
    this.router.navigate(['/auth/login']);
  }
}
