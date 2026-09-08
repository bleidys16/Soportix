import { Routes } from '@angular/router';

export default [
  { path: 'usuarios', title: 'Usuarios - Soportix', loadComponent: () => import('./pages/user-management-page').then((m) => m.UserManagementPage) },
  { path: 'categorias', title: 'Categorías - Soportix', loadComponent: () => import('./pages/category-management-page').then((m) => m.CategoryManagementPage) },
  { path: '', redirectTo: 'usuarios', pathMatch: 'full' },
] as Routes;
