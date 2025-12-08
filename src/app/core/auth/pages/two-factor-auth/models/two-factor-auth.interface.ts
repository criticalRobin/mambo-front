/**
 * Modelo para la verificación de 2FA
 */
export interface Verify2FARequest {
  id: number;
  email: string;
  mfaSecret: string;
  totp: string;
}

/**
 * Respuesta exitosa de la verificación 2FA
 */
export interface AuthResponse {
  token?: string;
  user?: any;
  [key: string]: any;
}

