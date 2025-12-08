import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { Verify2FARequest, AuthResponse } from '../models/two-factor-auth.interface';
import { ToastService } from '../../../../../shared/services/toast.service';
import { AuthService } from '../../../services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class TwoFactorAuthService {
  private readonly apiUrl = `${environment.BASE_URL}/auth`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService,
    private authService: AuthService
  ) {}

  /**
   * Verifica el código de 2FA
   */
  verify2FA(data: Verify2FARequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login-code`, data).pipe(
      tap({
        next: (response) => {
          // Guardar token y datos del usuario
          if (response.token) {
            this.authService.setAuthData(response.token, response.user);
          }
          this.toastService.showSuccess('Inicio de sesión exitoso', 'Bienvenido a MAMBO');
        },
        error: (error) => {
          this.toastService.showError(
            'Código inválido',
            error.error?.message || 'El código de verificación es incorrecto'
          );
        },
      })
    );
  }
}
