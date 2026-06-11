import { Routes } from '@angular/router';
import { Dashboard } from './modules/home/dashboard/dashboard';

export const routes: Routes = [
  {
    path: '',
    component: Dashboard,
  },
  {
    path: 'dashboard',
    component: Dashboard,
  },
];
