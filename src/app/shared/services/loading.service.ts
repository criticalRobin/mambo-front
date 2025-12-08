import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  // Contador de peticiones activas
  private activeRequests = signal<number>(0);

  // Signal que indica si hay peticiones activas
  isLoading = signal<boolean>(false);

  /**
   * Incrementa el contador de peticiones activas
   * Se llama cuando inicia una petición HTTP
   */
  show(): void {
    this.activeRequests.update((count) => {
      const newCount = count + 1;
      this.isLoading.set(newCount > 0);
      return newCount;
    });
  }

  /**
   * Decrementa el contador de peticiones activas
   * Se llama cuando finaliza una petición HTTP
   */
  hide(): void {
    this.activeRequests.update((count) => {
      const newCount = Math.max(0, count - 1);
      this.isLoading.set(newCount > 0);
      return newCount;
    });
  }

  /**
   * Fuerza el ocultamiento del loader
   * Útil para resetear el estado en caso de errores
   */
  forceHide(): void {
    this.activeRequests.set(0);
    this.isLoading.set(false);
  }
}

