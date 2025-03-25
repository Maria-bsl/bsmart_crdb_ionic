import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  catchError,
  delay,
  endWith,
  filter,
  finalize,
  interval,
  map,
  mergeMap,
  Observable,
  of,
  pairwise,
  startWith,
  switchMap,
  takeWhile,
  tap,
  withLatestFrom,
} from 'rxjs';
import { IonButton, IonText } from '@ionic/angular/standalone';
import { NgOtpInputModule } from 'ng-otp-input';
import { CommonModule } from '@angular/common';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { MatButtonModule } from '@angular/material/button';
import { load } from 'google-maps';

@Component({
  selector: 'app-otp-form-page',
  templateUrl: './otp-form-page.component.html',
  styleUrls: ['./otp-form-page.component.scss'],
  standalone: true,
  imports: [
    IonText,
    IonButton,
    TranslateModule,
    ReactiveFormsModule,
    NgOtpInputModule,
    CommonModule,
    MatButtonModule,
  ],
})
export class OtpFormPageComponent {
  otpCode$!: Observable<{ OTP_Code: string; email: string } | null>;
  otpCodeConfig$!: Observable<any>;
  formGroup!: FormGroup;
  timer$!: Observable<number>;
  private resendCodeTimeout: number = 300;
  constructor(
    private router: Router,
    private activatedRoute$: ActivatedRoute,
    private _fb: FormBuilder,
    private _loading: LoadingService,
    private _unsubscribe: UnsubscribeService,
    private _api: ApiService,
    private _appConfig: AppConfigService,
    private _tr: TranslateService
  ) {
    this.init();
    this.initOtpCode();
    this.createFormGroup();
    this.createOtpCode();
    this.startTimer();
  }
  private init() {
    const backButton = () => {
      const backToLogin = () => void 0;
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
  }
  private startTimer() {
    this.timer$ = interval(1000).pipe(
      map((elapsed) => this.resendCodeTimeout - elapsed),
      takeWhile((remaining) => remaining >= 0),
      startWith(this.resendCodeTimeout)
    );
  }
  private createOtpCode() {
    this.otpCodeConfig$ = of({
      allowNumbersOnly: true,
      length: 6,
      isPasswordInput: false,
      disableAutoFocus: false,
      placeholder: '',
      inputStyles: {
        width: '45px',
        height: '45px',
      },
      inputClass: 'bg-transparent',
    });
  }
  private initOtpCode() {
    this.otpCode$ = this.activatedRoute$.queryParamMap.pipe(
      map((value) => {
        return {
          email: atob(value.get('email')!),
          OTP_Code: atob(value.get('OTP_Code')!),
        };
      })
    );
  }
  private createFormGroup() {
    this.formGroup = this._fb.group({
      otpCode: this._fb.control('', [Validators.required]),
    });
  }
  resendOtpCode(event: any) {
    const erroneousRes = async (err: any) => {
      this._appConfig
        .openAlertMessageBox(
          this._tr.instant('DEFAULTS.WARNING'),
          this._tr.instant('OTP_PAGE.ERRORS.FAILED_TO_SEND_CODE')
        )
        .subscribe();
    };
    this._loading
      .open()
      .pipe(
        switchMap((loading) =>
          this.otpCode$.pipe(
            map((val) => {
              return { Email_Address: val?.email! };
            }),
            switchMap((body) =>
              this._api
                .sendForgotPasswordLink(body)
                .pipe(finalize(() => loading.close()))
            ),
            filterNotNull(),
            catchError((err) => erroneousRes(err))
          )
        )
      )
      .subscribe({
        next: (res: { Status: string; OTP_Code: string | null }[]) => {
          if (!res[0].OTP_Code) {
            this._appConfig
              .openAlertMessageBox('DEFAULTS.WARNING', res[0].Status)
              .subscribe();
          } else {
            this.otpCode$ = this.otpCode$.pipe(
              map((val) => {
                return { email: val?.email!, OTP_Code: res[0].OTP_Code! };
              })
            );
          }
        },
      });
  }
  submitForm(event: any) {
    if (this.formGroup.invalid) {
      this._appConfig
        .openAlertMessageBox('DEFAULTS.WARNING', 'OTP_PAGE.ERRORS.MISSING_CODE')
        .subscribe();
      return;
    }
    const openExpiredOtp = () => {
      const dialogRef = this._appConfig.openConfirmMessageBox(
        'DEFAULTS.WARNING',
        'OTP_PAGE.ERRORS.OTP_CODE_HAS_EXPIRED'
      );
      dialogRef
        .pipe(mergeMap((ref) => ref.componentInstance.confirmed.asObservable()))
        .subscribe({
          next: (value) => {
            console.log('has closed');
          },
        });
    };
    this._loading
      .open()
      .pipe(
        delay(1200),
        tap((loading) => loading && loading.close()),
        tap(() => !(this.resendCodeTimeout > 0) && openExpiredOtp()),
        filter(() => this.resendCodeTimeout > 0),
        mergeMap((loading) =>
          this.otpCode$.pipe(
            map((res) => {
              return { email: res?.email!, OTP_Code: res?.OTP_Code! };
            })
          )
        )
      )
      .subscribe({
        next: (value) => {
          const code = this.formGroup.value.otpCode;
          if (value.OTP_Code === code) {
            this.router.navigate(['/reset'], {
              queryParams: {
                email: btoa(value.email),
              },
            });
          } else {
            this._appConfig
              .openAlertMessageBox(
                'DEFAULTS.WARNING',
                'OTP_PAGE.ERRORS.OTP_CODE_DO_NOT_MATCH'
              )
              .subscribe();
          }
        },
      });
  }
  get otpCode() {
    return this.formGroup.get('otpCode') as FormControl;
  }
}
