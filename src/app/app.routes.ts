import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'page1',
    loadComponent: () =>
      import('./form/form.component').then(
        ({ FormComponent }) => FormComponent,
      ),
  },
  { path: '**', redirectTo: '/page1' },
];
