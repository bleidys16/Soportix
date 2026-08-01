import { Routes } from '@angular/router';

export default [
  { path: 'usuarios', loadComponent: () => import('./pages/user-management-page').then((m) => m.UserManagementPage) },
  { path: 'categorias', loadComponent: () => import('./pages/category-management-page').then((m) => m.CategoryManagementPage) },
  { path: 'reportes', loadComponent: () => import('./pages/reports-page').then((m) => m.ReportsPage) },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
] as Routes;
