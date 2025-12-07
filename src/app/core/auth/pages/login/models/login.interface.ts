/**
 * Modelo para el login inicial
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Respuesta del login inicial (antes de 2FA)
 */
export interface LoginResponse {
  id: number;
  email: string;
  mfaSecret: string;
}
