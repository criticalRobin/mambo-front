import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../shared/services/loading.service';

/**
 * Interceptor HTTP que muestra/oculta el loader automáticamente
 * durante las peticiones HTTP.
 * 
 * Maneja múltiples peticiones simultáneas usando un contador interno.
 */
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);

  // Mostrar loader al iniciar la petición
  loadingService.show();

  // Ocultar loader cuando la petición finalice (éxito o error)
  return next(req).pipe(
    finalize(() => {
      loadingService.hide();
    })
  );
};

