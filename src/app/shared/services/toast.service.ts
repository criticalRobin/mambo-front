import { Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ToastMessageOptions } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private messageService: MessageService) {}

  /**
   * Muestra un mensaje de éxito
   * @param summary Título del mensaje
   * @param detail Detalle del mensaje
   * @param life Duración en milisegundos (por defecto 3000)
   */
  showSuccess(summary: string, detail?: string, life: number = 3000): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail: detail || summary,
      life,
    });
  }

  /**
   * Muestra un mensaje de error
   * @param summary Título del mensaje
   * @param detail Detalle del mensaje
   * @param life Duración en milisegundos (por defecto 5000)
   */
  showError(summary: string, detail?: string, life: number = 5000): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail: detail || summary,
      life,
    });
  }

  /**
   * Muestra un mensaje de información
   * @param summary Título del mensaje
   * @param detail Detalle del mensaje
   * @param life Duración en milisegundos (por defecto 3000)
   */
  showInfo(summary: string, detail?: string, life: number = 3000): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail: detail || summary,
      life,
    });
  }

  /**
   * Muestra un mensaje de advertencia
   * @param summary Título del mensaje
   * @param detail Detalle del mensaje
   * @param life Duración en milisegundos (por defecto 4000)
   */
  showWarn(summary: string, detail?: string, life: number = 4000): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail: detail || summary,
      life,
    });
  }

  /**
   * Muestra un mensaje personalizado
   * @param options Opciones del mensaje
   */
  show(options: ToastMessageOptions): void {
    this.messageService.add(options);
  }

  /**
   * Limpia todos los mensajes
   */
  clear(): void {
    this.messageService.clear();
  }
}

