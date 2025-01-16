import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, timeout } from 'rxjs';
import { FSessionTokens } from 'src/app/models/forms/tokens.model';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';

export const authsInterceptor: HttpInterceptorFn = (req, next) => {
  if (
    req.url.includes('/SchoolDetails/GetToken') ||
    req.url.startsWith('/assets/')
  ) {
    return next(req);
  }
  const hasSecondsPassed = (date1: Date, date2: Date, seconds: number) => {
    const differenceInMilliseconds = date2.getTime() - date1.getTime();
    const secondsInMilliseconds = seconds * 1000;
    return differenceInMilliseconds >= secondsInMilliseconds;
  };

  const isValidSession = ({
    token,
    expire_time,
    expire_timestamp,
  }: FSessionTokens) => {
    const isNotNullOrEmpty = (value: string | null | undefined) =>
      value && value.length > 0;
    const isExistTokens =
      isNotNullOrEmpty(token) &&
      isNotNullOrEmpty(expire_time) &&
      isNotNullOrEmpty(expire_timestamp);
    if (!isExistTokens) return isExistTokens;
    const expireIn = new Date(expire_timestamp!);
    return !hasSecondsPassed(expireIn, new Date(), parseInt(expire_time!));
  };

  const setGwxAuthorization = (
    request: HttpRequest<unknown>,
    token: string
  ) => {
    return request.clone({
      headers: request.headers.set('GWX-Authorization', `Bearer ${token}`),
    });
  };

  const appConfig = inject(AppConfigService);
  if (isValidSession(appConfig.sessionTokens)) {
    let authReq = setGwxAuthorization(req, appConfig.sessionTokens?.token!);
    return next(authReq);
  } else {
    const apiService = inject(ApiService);
    return apiService.GetToken().pipe(
      switchMap((res) => {
        appConfig.sessionTokens = res;
        let authReq = setGwxAuthorization(req, appConfig.sessionTokens?.token!);
        return next(authReq);
      }),
      catchError((err: any) => {
        console.error('Error in getToken:', err); // Log error for debugging
        throw err; // Rethrow error if needed
      })
    );
  }
};

// export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
//   let timeoutDuration = 30000;
//   let appConfig = inject(AppConfigService);
//   let loadingService = inject(LoadingService);
//   return next(req).pipe(
//     timeout(timeoutDuration),
//     catchError((err) => {
//       appConfig.openAlertMessageBox(
//         'defaults.failed',
//         'defaults.errors.requestTookTooLong'
//       );
//       loadingService.dismiss();
//       return throwError(() => err);
//     })
//   );
// };
