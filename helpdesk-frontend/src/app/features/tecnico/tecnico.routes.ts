import { Routes } from '@angular/router';

export default [
  { path: '', loadComponent: () => import('./pages/tecnico-page').then((m) => m.TecnicoPage) },
] as Routes;
