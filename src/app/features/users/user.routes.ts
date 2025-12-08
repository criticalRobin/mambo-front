import { Routes } from '@angular/router';
import { Users } from './users';
import { authGuard } from '../../core/guards/auth.guard';

export const userRoutes: Routes = [
  {
    path: 'users',
    component: Users,
    canActivate: [authGuard],
  },
];
