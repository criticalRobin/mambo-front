import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/login.interface';
import { ToastService } from '../../../../../shared/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly apiUrl = `${environment.BASE_URL}/auth`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  /**
   * Inicia sesión (primera etapa - antes de 2FA)
   */
  login(data: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, data).pipe(
      tap({
        next: () => {
          this.toastService.showSuccess(
            'Credenciales válidas',
            'Ingresa el código de verificación'
          );
        },
        error: (error) => {
          this.toastService.showError(
            'Error al iniciar sesión',
            error.error?.message || 'Credenciales incorrectas'
          );
        },
      })
    );
  }
}

