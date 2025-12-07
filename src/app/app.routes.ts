import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Home } from './features/home/home';
import { authRoutes } from './core/auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  ...authRoutes,
  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        component: Home,
      },
    ],
  },
];
