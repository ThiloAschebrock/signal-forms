import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'page1',
    loadComponent: () =>
      import('./components/page1/page1.component').then(
        ({ Page1Component }) => Page1Component
      ),
  },
  {
    path: 'page2',
    loadComponent: () =>
      import('./components/page2/page2.component').then(
        ({ Page2Component }) => Page2Component
      ),
  },
  {
    path: 'quote',
    children: [
      {
        path: 'page3',
        data: {
          preload: '/quote',
        },
        loadComponent: () =>
          import('./components/page3/page3.component').then(
            ({ Page3Component }) => Page3Component
          ),
      },
      {
        path: 'page4',
        loadComponent: () =>
          import('./components/page4/page4.component').then(
            ({ Page4Component }) => Page4Component
          ),
      },
      {
        path: 'my/page5',
        data: {
          preload: '/quote',
        },
        loadComponent: () =>
          import('./components/page5/page5.component').then(
            ({ Page5Component }) => Page5Component
          ),
      },
      { path: '**', redirectTo: 'page4' },
    ],
  },
  { path: '**', redirectTo: '/page1' },
];
