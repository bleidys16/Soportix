import { Routes } from '@angular/router';

export default [
  { path: '', title: 'Mis tickets asignados - Soportix', loadComponent: () => import('./pages/agent-ticket-list-page').then((m) => m.AgentTicketListPage) },
  { path: ':id', title: 'Detalle del ticket - Soportix', loadComponent: () => import('./pages/agent-ticket-detail-page').then((m) => m.AgentTicketDetailPage) },
] as Routes;
