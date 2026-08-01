import { Routes } from '@angular/router';

export default [
  { path: '', loadComponent: () => import('./pages/ticket-list-page').then((m) => m.TicketListPage) },
  { path: 'new', loadComponent: () => import('./pages/ticket-create-page').then((m) => m.TicketCreatePage) },
  { path: ':id', loadComponent: () => import('./pages/ticket-detail-page').then((m) => m.TicketDetailPage) },
] as Routes;
