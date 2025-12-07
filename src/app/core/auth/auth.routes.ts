import { Routes } from '@angular/router';
import { Auth } from './auth';
import { Login } from './pages/login/login';
import { SignUp } from './pages/sign-up/sign-up';
import { TwoFactorAuth } from './pages/two-factor-auth/two-factor-auth';
import { publicGuard } from '../guards/public.guard';
import { twoFactorGuard } from '../guards/two-factor.guard';
import { AuthUnauthorized } from './pages/auth-unauthorized/auth-unauthorized';
import { AuthError } from './pages/auth-error/auth-error';
import { PasswordRecovery } from './pages/password-recovery/password-recovery';

export const authRoutes: Routes = [
  {
    path: 'auth',
    component: Auth,
    children: [
      {
        path: 'login',
        component: Login,
        canActivate: [publicGuard],
      },
      {
        path: 'sign-up',
        component: SignUp,
        canActivate: [publicGuard],
      },
      {
        path: '2fa',
        component: TwoFactorAuth,
        canActivate: [twoFactorGuard],
      },
    ],
  },
  {
    path: 'auth/auth-unauthorized',
    component: AuthUnauthorized,
    canActivate: [publicGuard],
  },
  {
    path: 'auth/auth-error',
    component: AuthError,
    canActivate: [publicGuard],
  },
  {
    path: 'auth/password-recovery',
    component: PasswordRecovery,
    canActivate: [publicGuard],
  },
];
