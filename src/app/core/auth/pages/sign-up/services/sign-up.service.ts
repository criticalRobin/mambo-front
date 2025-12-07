import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../../../environments/environment';
import { RegisterRequest } from '../models/sign-up.interface';
import { ToastService } from '../../../../../shared/services/toast.service';

@Injectable({
  providedIn: 'root',
})
export class SignUpService {
  private readonly apiUrl = `${environment.BASE_URL}/auth`;

  constructor(
    private http: HttpClient,
    private toastService: ToastService
  ) {}

  /**
   * Registra un nuevo usuario
   */
  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data).pipe(
      tap({
        next: () => {
          this.toastService.showSuccess(
            'Registro exitoso',
            'Tu cuenta ha sido creada correctamente'
          );
        },
        error: (error) => {
          this.toastService.showError(
            'Error al registrar',
            error.error?.message || 'No se pudo crear la cuenta'
          );
        },
      })
    );
  }
}

