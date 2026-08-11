import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
  },
  {
    path: '',
    loadComponent: () => import('./layout/layout').then((m) => m.Layout),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.routes'),
      },
      {
        path: 'tickets',
        loadChildren: () => import('./features/tickets/tickets.routes'),
      },
      {
        path: 'reportes',
        canActivate: [roleGuard],
        data: { roles: ['agent', 'admin'] },
        loadComponent: () => import('./features/admin/pages/reports-page').then((m) => m.ReportsPage),
      },
      {
        path: 'admin',
        canActivate: [roleGuard],
        data: { role: 'admin' },
        loadChildren: () => import('./features/admin/admin.routes'),
      },
      {
        path: 'agent',
        canActivate: [roleGuard],
        data: { role: 'agent' },
        loadChildren: () => import('./features/tecnico/tecnico.routes'),
      },
      { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
