import { EventEmitter, Injectable, OnDestroy, signal } from '@angular/core';
// import {
//   C2BMpesaPayment,
//   C2BMpesaResponse,
//   SessionKey,
// } from 'src/app/core/interfaces/c2b-mpesa';
import {
  from,
  retry,
  catchError,
  Observable,
  firstValueFrom,
  iif,
  of,
  map,
  filter,
  pairwise,
  tap,
  switchMap,
  finalize,
  concatMap,
  defaultIfEmpty,
  throwError,
} from 'rxjs';
import {
  filterNotNull,
  LoadingService,
} from '../loading-service/loading.service';
//import { UnsubscriberService } from '../unsubscriber/unsubscriber.service';
import { toast } from 'ngx-sonner';
import { TranslateService } from '@ngx-translate/core';
import { AppConfigService } from '../app-config/app-config.service';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { isPlatform } from '@ionic/angular/standalone';
import { CapacitorHttp } from '@capacitor/core';
import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';
import {
  SessionKey,
  C2BMpesaPayment,
  C2BMpesaResponse,
} from 'src/app/models/forms/mpesa.model';
import * as forge from 'node-forge';
import { environment } from 'src/environments/environment';
import { ApiService } from '../api-service/api.service';
import { SharedService } from '../shared-service/shared.service';

const GENERATE_SESSION_KEY_ENDPOINT =
  'https://openapi.m-pesa.com/sandbox/ipg/v2/vodacomTZN/getSession/';

const REQUEST_C2B_ENDPOINT =
  'https://openapi.m-pesa.com/sandbox/ipg/v2/vodacomTZN/c2bPayment/singleStage/';

@Injectable({
  providedIn: 'root',
})
export class PayWithMpesaService {
  //transactionCompleted: EventEmitter<boolean> = new EventEmitter(false);
  isLoading = signal<boolean>(false);
  constructor(
    private unsubscribe: UnsubscribeService,
    private tr: TranslateService,
    private appConfig: AppConfigService,
    private _shared: SharedService
  ) {}
  private encryptedToken(publicKey: string, token: string): string {
    try {
      const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
      const forgePublicKey = forge.pki.publicKeyFromPem(publicKeyPem);
      const encryptedBytes = forgePublicKey.encrypt(token, 'RSAES-PKCS1-V1_5');
      const encryptedBase64 = forge.util.encode64(encryptedBytes);
      return encryptedBase64;
    } catch (err: any) {
      console.error('Error encrypting token:', err.message);
      console.error(err);
      return '';
    }
  }
  private generateKey(token: string): Observable<SessionKey> {
    AbortSignal.timeout ??= function timeout(ms) {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), ms);
      return ctrl.signal;
    };

    if (isPlatform('capacitor')) {
      let p = CapacitorHttp.get({
        url: GENERATE_SESSION_KEY_ENDPOINT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Origin: '*',
        },
        connectTimeout: 15000,
        readTimeout: 15000,
      })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          throw err;
        });
      return from(p).pipe(
        retry(3),
        catchError((err) => {
          throw err;
        })
      );
    } else {
      let promise = fetch(`${`${GENERATE_SESSION_KEY_ENDPOINT}`}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Origin: '*',
        },
        signal: AbortSignal.timeout(30000),
      })
        .then((res) => {
          return res.json();
        })
        .catch((err) => {
          throw err;
        });
      return from(promise).pipe(
        retry(3),
        catchError((err) => {
          throw err;
        })
      );
    }
  }
  private sendC2BRequest(payment: C2BMpesaPayment, sessionKey: SessionKey) {
    const token = this.encryptedToken(
      environment.MPESA_PUBLIC_KEY,
      sessionKey.output_SessionID
    );
    AbortSignal.timeout ??= function timeout(ms) {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort(), ms);
      return ctrl.signal;
    };
    if (isPlatform('capacitor')) {
      let p = CapacitorHttp.post({
        url: REQUEST_C2B_ENDPOINT,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Origin: '*',
        },
        connectTimeout: 15000,
        readTimeout: 15000,
        data: payment,
      })
        .then((res) => {
          return res.data;
        })
        .catch((err) => {
          throw err;
        });
      return from(p).pipe(
        retry(3),
        catchError((err) => {
          throw err;
        })
      );
    } else {
      let promise = fetch(`${`${REQUEST_C2B_ENDPOINT}`}`, {
        method: 'post',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          Origin: '*',
        },
        signal: AbortSignal.timeout(30000),
        body: JSON.stringify(payment),
      })
        .then((res) => {
          return res.json();
        })
        .catch((err) => {
          throw err;
        });
      return from(promise).pipe(
        retry(3),
        catchError((err) => {
          throw err;
        })
      );
    }
  }
  private async switchC2BResponse(res: C2BMpesaResponse) {
    let title = 'SUBSCRIPTION_PAGE.ERRORS.FAILED_TRANSACTION';
    let message = 'SUBSCRIPTION_PAGE.ERRORS.PROCESSING_FAILED';
    switch (res.output_ResponseCode) {
      case 'INS-2051': //MSISDN invalid
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-2006': //Insufficient balance
        message = 'SUBSCRIPTION_PAGE.ERRORS.INSUFFICIENT_FUNDS';
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-998': //Invalid Market
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-997': //API Not Enabled
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-996': //API Used outside of usage time
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-995': //API Single Transaction Limit Breached
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-994': //Organization Transaction Value Limit Breached
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-993	': //Organization Transaction Count Limit Breached
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-992': //Multiple Limits Breached
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-991': //Customer Transaction Count Limit Breached
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-990': //Customer Transaction Value Limit Breached
        message = 'SUBSCRIPTION_PAGE.ERRORS.CUSTOMER_TRANSACTION_LIMIT_REACHED';
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-30': //Invalid Purchased Items Description Used
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-28': //Invalid ThirdPartyConversationID Used
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-26': //Invalid Currency Used
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-21': //Parameter validations failed. Please try again.
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-20': //Not All Parameters Provided. Please try again.
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-17': //Invalid Transaction Reference. Length Should Be Between 1 and 20.
        message = 'SUBSCRIPTION_PAGE.ERRORS.INVALID_REFERENCE_NUMBER';
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-15': //Invalid Amount Used
        message = 'SUBSCRIPTION_PAGE.ERRORS.INVALID_AMOUNT_USED';
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-13': //Invalid Shortcode Used
        message = 'SUBSCRIPTION_PAGE.ERRORS.INVALID_SHORT_CODE';
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-10': //Duplicate Transaction
        message = 'SUBSCRIPTION_PAGE.ERRORS.DUPLICATE_TRANSACTION';
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-9': //Request timeout
        message = 'SUBSCRIPTION_PAGE.ERRORS.TRANSACTION_CANCELLED';
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-6': //Transaction Failed
        message = 'SUBSCRIPTION_PAGE.ERRORS.TRANSACTION_FAILED_CHECK_PIN';
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-1': //Internal Error
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
      case 'INS-0': //Request processed successfully
        const ref = this.appConfig.openStatePanel(
          'success',
          this.tr.instant('SUBSCRIPTION_PAGE.LABELS.TRANSACTION_COMPLETED'),
          true
        );
        ref.componentInstance.buttonClicked.asObservable().subscribe({
          next: () => this._shared.transactionSuccess.emit(),
        });
        this.isLoading.set(false);
        return;
      default:
        this.appConfig.openAlertMessageBox(title, message).subscribe();
        this.isLoading.set(false);
        return;
    }
  }
  private parseSendC2BResponse(response$: Observable<C2BMpesaResponse>) {
    response$.pipe(this.unsubscribe.takeUntilDestroy).subscribe({
      next: (res) => {
        this.switchC2BResponse(res);
      },
      error: (err) => {
        this.appConfig
          .openAlertMessageBox(
            'SUBSCRIPTION_PAGE.ERRORS.FAILED_TRANSACTION',
            'SUBSCRIPTION_PAGE.ERRORS.PROCESSING_FAILED'
          )
          .subscribe();
        this.isLoading.set(false);
      },
    });
  }
  makeC2BPayment(payment: C2BMpesaPayment) {
    this.isLoading.set(true);
    const encryptNewSessionKey = () => {
      const token = this.encryptedToken(
        environment.MPESA_PUBLIC_KEY,
        environment.MPESA_APP_API_KEY
      );
      const generatedSessionKey$ = this.generateKey(token);
      generatedSessionKey$.pipe(this.unsubscribe.takeUntilDestroy).subscribe({
        next: (response) => {
          if (response.output_ResponseCode === 'INS-0') {
            response.at = new Date().toISOString();
            const stringifySessionKey = JSON.stringify(response);
            localStorage.setItem('sessionKey', stringifySessionKey);
            const res$ = this.sendC2BRequest(payment, response);
            this.parseSendC2BResponse(res$);
          } else {
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.error(err);
          const title = 'SUBSCRIPTION_PAGE.ERRORS.FAILED_TRANSACTION';
          const message = 'SUBSCRIPTION_PAGE.ERRORS.PROCESSING_FAILED';
          this.appConfig.openAlertMessageBox(title, message).subscribe();
          this.isLoading.set(false);
        },
      });
    };
    let sessionKey = localStorage.getItem('sessionKey');
    if (!sessionKey) {
      encryptNewSessionKey();
    } else {
      const foundSessionKey = JSON.parse(sessionKey) as SessionKey;
      const lastTime = new Date(foundSessionKey.at!);
      const differenceInMilliseconds =
        new Date().getTime() - lastTime.getTime();
      const differenceInHours = differenceInMilliseconds / (1000 * 60 * 60);
      if (differenceInHours >= 1) {
        encryptNewSessionKey();
      } else {
        const res$ = this.sendC2BRequest(payment, foundSessionKey);
        this.parseSendC2BResponse(res$);
      }
    }
  }
}
