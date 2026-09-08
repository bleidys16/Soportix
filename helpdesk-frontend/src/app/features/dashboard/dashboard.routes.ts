import { Routes } from '@angular/router';

export default [
  { path: '', title: 'Dashboard - Soportix', loadComponent: () => import('./pages/dashboard-page').then((m) => m.DashboardPage) },
] as Routes;
