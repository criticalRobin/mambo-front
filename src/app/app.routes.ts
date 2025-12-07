import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Home } from './features/home/home';

export const routes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        component: Home,
      },
    ],
  },
];
