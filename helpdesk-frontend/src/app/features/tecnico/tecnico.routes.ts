import { Routes } from '@angular/router';

export default [
  { path: '', loadComponent: () => import('./pages/agent-ticket-list-page').then((m) => m.AgentTicketListPage) },
  { path: ':id', loadComponent: () => import('./pages/agent-ticket-detail-page').then((m) => m.AgentTicketDetailPage) },
] as Routes;
