import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'page1',
    loadComponent: () => import('./form/form.component').then(({ FormComponent }) => FormComponent),
  },
  {
    path: 'minimal',
    loadComponent: () =>
      import('./minimal/minimal.component').then(({ MinimalComponent }) => MinimalComponent),
  },
  { path: '**', redirectTo: '/page1' },
];
