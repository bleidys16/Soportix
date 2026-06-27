import { Routes } from '@angular/router';

export default [
  { path: '', loadComponent: () => import('./pages/tickets-page').then((m) => m.TicketsPage) },
] as Routes;
