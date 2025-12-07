import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

/**
 * Guard para rutas públicas (login, sign-up)
 * Redirige a home si el usuario ya está autenticado
 */
export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    // Si ya está autenticado, redirigir a home
    router.navigate(['/']);
    return false;
  }

  return true;
};

