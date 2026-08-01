import { Routes } from '@angular/router';

export default [
  { path: 'usuarios', loadComponent: () => import('./pages/admin-page').then((m) => m.AdminPage) },
  { path: 'reportes', loadComponent: () => import('./pages/admin-page').then((m) => m.AdminPage) },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
] as Routes;
