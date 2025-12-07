import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthStorageService } from '../auth/services/auth-storage.service';

/**
 * Guard que protege la ruta de 2FA
 * Solo permite acceso si hay datos de 2FA en sessionStorage (después de login inicial)
 * Redirige al login si no hay datos de 2FA
 */
export const twoFactorGuard: CanActivateFn = (route, state) => {
  const authStorageService = inject(AuthStorageService);
  const router = inject(Router);

  if (authStorageService.has2FAData()) {
    return true;
  }

  // Redirigir al login si no hay datos de 2FA
  router.navigate(['/auth/login']);
  return false;
};
