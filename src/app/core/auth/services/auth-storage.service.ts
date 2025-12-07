import { Injectable } from '@angular/core';

/**
 * Servicio para almacenar temporalmente los datos de 2FA
 * entre el login inicial y la verificación del código
 */
@Injectable({
  providedIn: 'root',
})
export class AuthStorageService {
  private readonly STORAGE_KEY = 'auth_2fa_data';

  /**
   * Guarda los datos de 2FA en sessionStorage
   */
  set2FAData(data: { id: number; email: string; mfaSecret: string }): void {
    sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Obtiene los datos de 2FA de sessionStorage
   */
  get2FAData(): { id: number; email: string; mfaSecret: string } | null {
    const data = sessionStorage.getItem(this.STORAGE_KEY);
    if (!data) {
      return null;
    }
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Limpia los datos de 2FA de sessionStorage
   */
  clear2FAData(): void {
    sessionStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Verifica si hay datos de 2FA almacenados
   */
  has2FAData(): boolean {
    return this.get2FAData() !== null;
  }
}

