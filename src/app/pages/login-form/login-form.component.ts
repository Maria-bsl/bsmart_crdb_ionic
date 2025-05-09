import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonTitle,
  isPlatform,
  IonButton,
  IonText,
  IonModal,
  IonHeader,
  IonToolbar,
  IonItem,
  IonButtons,
  IonInput,
} from '@ionic/angular/standalone';
import { NgOptimizedImage } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { MatIconModule } from '@angular/material/icon';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { ApiService } from 'src/app/services/api-service/api.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { FLoginForm } from 'src/app/models/forms/login.model';
import {
  catchError,
  EMPTY,
  filter,
  finalize,
  map,
  mergeMap,
  of,
  switchMap,
  tap,
  timeout,
} from 'rxjs';
import { NavController } from '@ionic/angular/standalone';
import {
  GetSDetails,
  GetSDetailsErrorStatus,
} from 'src/app/models/responses/RGetSDetails';
import { HasFormControlErrorPipe } from 'src/app/pipes/has-form-control-error/has-form-control-error.pipe';
import {
  ExternalLinks,
  PackageNames,
} from 'src/app/models/forms/package-names';
import { AppUtilities } from 'src/app/utils/AppUtilities';
import { MatDialog } from '@angular/material/dialog';
import { PayWithMpesaComponent } from 'src/app/components/dialogs/pay-with-mpesa/pay-with-mpesa.component';
import { PayWithMpesaService } from 'src/app/services/pay-with-mpesa/pay-with-mpesa.service';
import { environment } from 'src/environments/environment.prod';
import { OpenaiService } from 'src/app/services/openai-service/openai.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [
    IonInput,
    IonText,
    TranslateModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    ReactiveFormsModule,
    IonButton,
    RouterLink,
    HasFormControlErrorPipe,
    IonModal,
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonItem,
    IonTitle,
  ],
})
export class LoginFormComponent {
  loginFormGroup!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private _loading: LoadingService,
    private _api: ApiService,
    private _appConfig: AppConfigService,
    private _unsubscribe: UnsubscribeService,
    private navCtrl: NavController,
    private _mpesa: PayWithMpesaService,
    private _openAi: OpenaiService
  ) {
    this.registerIcons();
    this.createLoginFormGroup();
  }
  private createLoginFormGroup() {
    this.loginFormGroup = this.fb.group({
      User_Name: this.fb.control('', [Validators.required]),
      Password: this.fb.control('', [Validators.required]),
    });
  }
  private registerIcons() {
    const icons = ['eye', 'eye-slash', 'person-fill', 'lock-fill'];
    this._appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
  private loginUser(body: FLoginForm) {
    const login = (res: GetSDetails[] | GetSDetailsErrorStatus[]) => {
      if (Object.prototype.hasOwnProperty.call(res[0], 'status')) {
        this._appConfig
          .openAlertMessageBox(
            'DEFAULTS.FAILED',
            'LOGIN.LOGIN_FORM.ERRORS.USERNAME_OR_PASSWORD_INCORRECT'
          )
          .subscribe();
      } else {
        let GetSDetails = JSON.stringify(res[0]);
        localStorage.setItem('GetSDetails', GetSDetails);
        localStorage.setItem('User_Name', body.User_Name);
        localStorage.setItem('Password', body.Password);
        this.navCtrl.navigateForward(['/home']);
      }
    };
    this._loading
      .open()
      .pipe(
        switchMap((ref) =>
          this._api.signIn(body).pipe(
            this._unsubscribe.takeUntilDestroy,
            catchError((err) => {
              this._appConfig
                .openAlertMessageBox(
                  'DEFAULTS.FAILED',
                  'DEFAULTS.ERRORS.UNEXPECTED_ERROR_OCCURED'
                )
                .subscribe();
              throw err;
            }),
            filterNotNull(),
            map((result) => result[0]),
            tap(
              (res) =>
                AppUtilities.hasOwnProperty(res, 'status') &&
                (res as GetSDetailsErrorStatus).status !== 'Expired' &&
                this._appConfig
                  .openAlertMessageBox(
                    'DEFAULTS.FAILED',
                    'LOGIN.LOGIN_FORM.ERRORS.USERNAME_OR_PASSWORD_INCORRECT'
                  )
                  .subscribe()
            ),
            tap(
              (res) =>
                AppUtilities.hasOwnProperty(res, 'status') &&
                (res as GetSDetailsErrorStatus).status === 'Expired' &&
                this.navCtrl.navigateForward(['/package'], {
                  queryParams: {
                    User_Name: btoa(this.User_Name.value),
                    Password: btoa(this.Password.value),
                  },
                })
            ),
            filter((res) => !AppUtilities.hasOwnProperty(res, 'status')),
            tap((res) => {
              const GetSDetails = JSON.stringify(res);
              localStorage.setItem('GetSDetails', GetSDetails);
              localStorage.setItem('User_Name', body.User_Name);
              localStorage.setItem('Password', body.Password);
              this.navCtrl.navigateForward(['/home']);
            }),
            finalize(() => ref && ref.close())
          )
        )
      )
      .subscribe();
  }
  onRegisterClicked(event: MouseEvent) {
    this.router.navigate(['/register'], { replaceUrl: true });
  }
  submitForm(event: MouseEvent) {
    this.User_Name.setValue(this.User_Name.value.trim());
    this.Password.setValue(this.Password.value.trim());
    if (this.loginFormGroup.valid) {
      this.loginUser({
        ...this.loginFormGroup.value,
      });
    } else {
      this.loginFormGroup.markAllAsTouched();
    }
  }
  get isCapacitor() {
    return isPlatform('capacitor');
  }
  get User_Name() {
    return this.loginFormGroup.get('User_Name') as FormControl;
  }
  get Password() {
    return this.loginFormGroup.get('Password') as FormControl;
  }
}
