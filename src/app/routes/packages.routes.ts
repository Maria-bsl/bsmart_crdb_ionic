import { Routes } from '@angular/router';
import {
  loginPageLanguageGuard,
  selectLanguagePageGuard,
} from '../guards/select-language/select-language.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../pages/package-page/package-page.component').then(
        (c) => c.PackagePageComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import(
            '../pages/latest-subscriptions-page/latest-subscriptions-page.component'
          ).then((f) => f.LatestSubscriptionsPageComponent),
      },
      {
        path: 'subscribe',
        loadComponent: () =>
          import('../pages/subscription-page/subscription-page.component').then(
            (c) => c.SubscriptionPageComponent
          ),
      },
      {
        path: 'history',
        loadComponent: () =>
          import('../pages/package-history/package-history.component').then(
            (c) => c.PackageHistoryComponent
          ),
      },
    ],
  },
];
