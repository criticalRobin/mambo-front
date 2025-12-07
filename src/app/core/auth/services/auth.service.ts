import { Injectable, signal } from '@angular/core';

/**
 * Servicio para gestionar el estado de autenticación de la aplicación
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';

  // Signal que indica si el usuario está autenticado
  isAuthenticated = signal<boolean>(false);

  constructor() {
    // Verificar si hay token al inicializar
    this.checkAuthStatus();
  }

  /**
   * Verifica el estado de autenticación
   */
  private checkAuthStatus(): void {
    const token = this.getToken();
    this.isAuthenticated.set(!!token);
  }

  /**
   * Guarda el token y datos del usuario después de autenticación exitosa
   */
  setAuthData(token: string, user?: any): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    if (user) {
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    }
    this.isAuthenticated.set(true);
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Obtiene los datos del usuario autenticado
   */
  getUser(): any | null {
    const user = localStorage.getItem(this.USER_KEY);
    if (!user) {
      return null;
    }
    try {
      return JSON.parse(user);
    } catch {
      return null;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.isAuthenticated.set(false);
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }
}

