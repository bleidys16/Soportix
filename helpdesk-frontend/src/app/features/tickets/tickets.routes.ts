import { Routes } from '@angular/router';

export default [
  { path: '', title: 'Tickets - Soportix', loadComponent: () => import('./pages/ticket-list-page').then((m) => m.TicketListPage) },
  { path: 'new', title: 'Nuevo ticket - Soportix', loadComponent: () => import('./pages/ticket-create-page').then((m) => m.TicketCreatePage) },
  { path: ':id', title: 'Detalle del ticket - Soportix', loadComponent: () => import('./pages/ticket-detail-page').then((m) => m.TicketDetailPage) },
] as Routes;
