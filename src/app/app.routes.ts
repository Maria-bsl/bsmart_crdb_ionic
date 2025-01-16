import { Routes } from '@angular/router';
import {
  homeGuard,
  loginPageLanguageGuard,
  selectLanguagePageGuard,
} from './guards/select-language/select-language.guard';

export const routes: Routes = [
  {
    path: 'select-language',
    loadComponent: () =>
      import(
        './pages/select-language-page/select-language-page.component'
      ).then((m) => m.SelectLanguagePageComponent),
    canActivate: [selectLanguagePageGuard],
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./pages/home-form/home-form.component').then(
        (c) => c.HomeFormComponent
      ),
    canActivate: [homeGuard],
  },
  {
    path: 'add-student',
    loadComponent: () =>
      import('./pages/add-student-form/add-student-form.component').then(
        (c) => c.AddStudentFormComponent
      ),
  },
  {
    path: '',
    loadChildren: () => import('./routes/auth.routes').then((r) => r.routes),
  },
  {
    path: 'tabs',
    loadChildren: () =>
      import('./pages/tabs/tabs.routes').then((c) => c.routes),
  },
];
