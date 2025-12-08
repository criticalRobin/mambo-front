import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Home } from './features/home/home';
import { authRoutes } from './core/auth/auth.routes';
import { authGuard } from './core/guards/auth.guard';
import { userRoutes } from './features/users/user.routes';

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
      {
        path: 'documentos',
        loadChildren: () => import('./features/documents/documents.routes').then(m => m.documentsRoutes)
      },
      {
        path: 'perfil',
        loadChildren: () => import('./features/profile/profile.routes').then(m => m.profileRoutes)
      },
      ...userRoutes,
    ],
  },
];
