import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'fan', pathMatch: 'full' },
  {
    path: 'fan',
    loadComponent: () => import('./features/fan/fan-view.component').then((m) => m.FanViewComponent)
  },
  {
    path: 'staff',
    loadComponent: () => import('./features/staff/staff-view.component').then((m) => m.StaffViewComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-view.component').then((m) => m.AdminViewComponent)
  }
];
