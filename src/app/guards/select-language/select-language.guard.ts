import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AppConst } from 'src/app/utils/app-const';

export const loginPageLanguageGuard: CanActivateFn = (route, state) => {
  const router: Router = inject(Router);
  const urlTree = (path: string[]) => router.createUrlTree(path);
  const currentLang = localStorage.getItem(AppConst.CURRENT_LANG);
  return !currentLang ? urlTree(['/select-language']) : true;
};

export const selectLanguagePageGuard: CanActivateFn = (routes, state) => {
  const router: Router = inject(Router);
  const urlTree = (path: string[]) => router.createUrlTree(path);
  const currentLang = localStorage.getItem(AppConst.CURRENT_LANG);
  return currentLang ? urlTree(['/login']) : true;
};

export const homeGuard: CanActivateFn = (route, state) => {
  let students = localStorage.getItem('GetSDetails');
  return students ? true : inject(Router).createUrlTree(['/login']);
};
