import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../auth/services/auth.service';

/**
 * Guard que protege rutas que requieren autenticación completa
 * Redirige al login si el usuario no está autenticado
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  // Redirigir al login si no está autenticado
  router.navigate(['/auth/auth-unauthorized']);
  return false;
};
