import { EventEmitter, Injectable, OnDestroy, signal } from '@angular/core';
// import {
//   C2BMpesaPayment,
//   C2BMpesaResponse,
//   SessionKey,
// } from 'src/app/core/interfaces/c2b-mpesa';
//import * as crypto from 'crypto';
import { from, retry, catchError, Observable, firstValueFrom } from 'rxjs';
import { LoadingService } from '../loading-service/loading.service';
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

const GENERATE_SESSION_KEY_ENDPOINT =
  'https://openapi.m-pesa.com/sandbox/ipg/v2/vodacomTZN/getSession/';

const REQUEST_C2B_ENDPOINT =
  'https://openapi.m-pesa.com/sandbox/ipg/v2/vodacomTZN/c2bPayment/singleStage/';

@Injectable({
  providedIn: 'root',
})
export class PayWithMpesaService {
  transactionCompleted: EventEmitter<boolean> = new EventEmitter(false);
  isLoading = signal<boolean>(false);
  constructor(
    private loadingService: LoadingService,
    private unsubscribe: UnsubscribeService,
    private tr: TranslateService,
    private appConfig: AppConfigService,
    private router: Router
  ) {}
  private _publicKeyBase64 =
    'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEArv9yxA69XQKBo24BaF/D+fvlqmGdYjqLQ5WtNBb5tquqGvAvG3WMFETVUSow/LizQalxj2ElMVrUmzu5mGGkxK08bWEXF7a1DEvtVJs6nppIlFJc2SnrU14AOrIrB28ogm58JjAl5BOQawOXD5dfSk7MaAA82pVHoIqEu0FxA8BOKU+RGTihRU+ptw1j4bsAJYiPbSX6i71gfPvwHPYamM0bfI4CmlsUUR3KvCG24rB6FNPcRBhM3jDuv8ae2kC33w9hEq8qNB55uw51vK7hyXoAa+U7IqP1y6nBdlN25gkxEA8yrsl1678cspeXr+3ciRyqoRgj9RD/ONbJhhxFvt1cLBh+qwK2eqISfBb06eRnNeC71oBokDm3zyCnkOtMDGl7IvnMfZfEPFCfg5QgJVk1msPpRvQxmEsrX9MQRyFVzgy2CWNIb7c+jPapyrNwoUbANlN8adU1m6yOuoX7F49x+OjiG2se0EJ6nafeKUXw/+hiJZvELUYgzKUtMAZVTNZfT8jjb58j8GVtuS+6TM2AutbejaCV84ZK58E2CRJqhmjQibEUO6KPdD7oTlEkFy52Y1uOOBXgYpqMzufNPmfdqqqSM4dU70PO8ogyKGiLAIxCetMjjm6FCMEA3Kc8K0Ig7/XtFm9By6VxTJK1Mg36TlHaZKP6VzVLXMtesJECAwEAAQ==';
  private _apiKey = 'RhldyLF56YkXbhusKjaS6VnT4X480ADP';
  private encryptedToken(publicKey: string, token: string): string {
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
    try {
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
      this._publicKeyBase64,
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
    let title = 'subscriptionPage.errors.failedTransaction';
    let message = 'subscriptionPage.errors.processingFailed';
    switch (res.output_ResponseCode) {
      case 'INS-2051': //MSISDN invalid
        break;
      case 'INS-2006': //Insufficient balance
        message = 'subscriptionPage.errors.insufficientFunds';
        break;
      case 'INS-998': //Invalid Market
        break;
      case 'INS-997': //API Not Enabled
        break;
      case 'INS-996': //API Used outside of usage time
        break;
      case 'INS-995': //API Single Transaction Limit Breached
        break;
      case 'INS-994': //Organization Transaction Value Limit Breached
        break;
      case 'INS-993	': //Organization Transaction Count Limit Breached
        break;
      case 'INS-992': //Multiple Limits Breached
        break;
      case 'INS-991': //Customer Transaction Count Limit Breached
        break;
      case 'INS-990': //Customer Transaction Value Limit Breached
        message = 'subscriptionPage.errors.customerTransactionLimitReached';
        break;
      case 'INS-30': //Invalid Purchased Items Description Used
        break;
      case 'INS-28': //Invalid ThirdPartyConversationID Used
        break;
      case 'INS-26': //Invalid Currency Used
        break;
      case 'INS-21': //Parameter validations failed. Please try again.
        break;
      case 'INS-20': //Not All Parameters Provided. Please try again.
        break;
      case 'INS-17': //Invalid Transaction Reference. Length Should Be Between 1 and 20.
        message = 'subscriptionPage.errors.invalidReferenceNumber';
        break;
      case 'INS-15': //Invalid Amount Used
        message = 'subscriptionPage.errors.invalidAmountUsed';
        break;
      case 'INS-13': //Invalid Shortcode Used
        message = 'subscriptionPage.errors.invalidShortCode';
        break;
      case 'INS-10': //Duplicate Transaction
        message = 'subscriptionPage.errors.duplicateTransaction';
        break;
      case 'INS-9': //Request timeout
        message = 'subscriptionPage.errors.transactionCancelled';
        break;
      case 'INS-6': //Transaction Failed
        message = 'subscriptionPage.errors.transactionFailedCheckPin';
        break;
      case 'INS-1': //Internal Error
        break;
      case 'INS-0': //Request processed successfully
        let successText = await firstValueFrom(this.tr.get('defaults.success'));
        let text = await firstValueFrom(
          this.tr.get('subscriptionPage.labels.transactionCompleted')
        );
        Swal.fire({
          title: successText,
          text: text,
          icon: 'success',
          heightAuto: false,
          allowOutsideClick: false,
        }).then((dialog) => {
          if (dialog.isConfirmed) {
            this.router.navigateByUrl('/tabs/tab-1/dashboard', {
              replaceUrl: true,
            });
          }
        });
        this.transactionCompleted.emit(true);
        return;
      default:
        break;
    }
    this.appConfig.openAlertMessageBox(title, message);
    this.isLoading.set(false);
  }
  private parseSendC2BResponse(response$: Observable<C2BMpesaResponse>) {
    response$.pipe(this.unsubscribe.takeUntilDestroy).subscribe({
      next: (res) => {
        this.switchC2BResponse(res);
      },
      error: (err) => {
        let title = 'subscriptionPage.errors.failedTransaction';
        let message = 'subscriptionPage.errors.processingFailed';
        this.appConfig.openAlertMessageBox(title, message);
        this.isLoading.set(false);
      },
    });
  }
  makeC2BPayment(payment: C2BMpesaPayment) {
    this.isLoading.set(true);
    const encryptNewSessionKey = () => {
      const token = this.encryptedToken(this._publicKeyBase64, this._apiKey);
      const generatedSessionKey$ = this.generateKey(token);
      generatedSessionKey$.pipe(this.unsubscribe.takeUntilDestroy).subscribe({
        next: (response) => {
          if (response.output_ResponseCode === 'INS-0') {
            response.at = new Date().toISOString();
            let stringifySessionKey = JSON.stringify(response);
            localStorage.setItem('sessionKey', stringifySessionKey);
            const res$ = this.sendC2BRequest(payment, response);
            this.parseSendC2BResponse(res$);
          } else {
            this.isLoading.set(false);
          }
        },
        error: (err) => {
          console.error(err);
          let title = 'subscriptionPage.errors.failedTransaction';
          let message = 'subscriptionPage.errors.processingFailed';
          this.appConfig.openAlertMessageBox(title, message);
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
