import { Routes } from '@angular/router';
import {
  loginPageLanguageGuard,
  selectLanguagePageGuard,
} from '../guards/select-language/select-language.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../components/layouts/auth/auth.component').then(
        (c) => c.AuthComponent
      ),
    children: [
      {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full',
      },
      {
        path: 'login',
        loadComponent: () =>
          import('../pages/login-form/login-form.component').then(
            (m) => m.LoginFormComponent
          ),
        canActivate: [loginPageLanguageGuard],
      },
      {
        path: 'register',
        loadComponent: () =>
          import('../pages/register-form/register-form.component').then(
            (c) => c.RegisterFormComponent
          ),
      },
      {
        path: 'forgot',
        loadComponent: () =>
          import(
            '../pages/forgot-password-form/forgot-password-form.component'
          ).then((c) => c.ForgotPasswordFormComponent),
      },
      {
        path: 'otp',
        loadComponent: () =>
          import('../pages/otp-form-page/otp-form-page.component').then(
            (e) => e.OtpFormPageComponent
          ),
      },
      {
        path: 'reset',
        loadComponent: () =>
          import(
            '../pages/reset-password-form/reset-password-form.component'
          ).then((m) => m.ResetPasswordFormComponent),
      },
    ],
  },
];
