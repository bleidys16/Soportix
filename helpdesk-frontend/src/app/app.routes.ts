import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { guestGuard } from './core/guards/guest-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Soportix - Mesa de ayuda para tu equipo',
    loadComponent: () => import('./features/landing/landing-page').then((m) => m.LandingPage),
  },
  {
    path: 'login',
    title: 'Iniciar sesión - Soportix',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Crear cuenta - Soportix',
    loadComponent: () => import('./auth/register/register').then((m) => m.Register),
  },
  {
    path: 'onboarding',
    title: 'Bienvenida - Soportix',
    canActivate: [authGuard],
    loadComponent: () => import('./features/onboarding/onboarding-page').then((m) => m.OnboardingPage),
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
        title: 'Reportes - Soportix',
        loadComponent: () => import('./features/admin/pages/reports-page').then((m) => m.ReportsPage),
      },
      {
        path: 'respuestas',
        canActivate: [roleGuard],
        data: { roles: ['agent', 'admin'] },
        title: 'Respuestas predefinidas - Soportix',
        loadComponent: () =>
          import('./features/tickets/pages/canned-response-management-page').then((m) => m.CannedResponseManagementPage),
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
  {
    path: '404',
    title: 'Página no encontrada - Soportix',
    loadComponent: () => import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
  { path: '**', redirectTo: '/404' },
];
