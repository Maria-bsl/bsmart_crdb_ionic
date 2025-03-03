import { Component, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonButton, IonText } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { addIcons } from 'ionicons';
import { keyOutline } from 'ionicons/icons';
import { NavController } from '@ionic/angular/standalone';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { ApiService } from 'src/app/services/api-service/api.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { finalize, zip } from 'rxjs';
import { toast } from 'ngx-sonner';
import { HasFormControlErrorPipe } from 'src/app/pipes/has-form-control-error/has-form-control-error.pipe';

@Component({
  selector: 'app-forgot-password-form',
  templateUrl: './forgot-password-form.component.html',
  styleUrls: ['./forgot-password-form.component.scss'],
  standalone: true,
  imports: [
    IonButton,
    IonText,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    RouterLink,
    ReactiveFormsModule,
    HasFormControlErrorPipe,
  ],
})
export class ForgotPasswordFormComponent {
  formGroup!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private _appConfig: AppConfigService,
    private _apiService: ApiService,
    private navCtrl: NavController,
    private unsubscribe: UnsubscribeService,
    private loadingService: LoadingService,
    private router: Router,
    private _tr: TranslateService,
    private _unsubscribe: UnsubscribeService
  ) {
    this.registerIcons();
    this.createFormGroup();
    this.backButtonHandler();
  }
  private backButtonHandler() {
    const backToHome = () => this.navCtrl.navigateRoot('/login');
    this._appConfig.backButtonEventHandler(backToHome);
  }
  private registerIcons() {
    let icons = ['key', 'chevron-left'];
    let bootstrapIcons = ['book-fill'];

    this._appConfig.addIcons(icons, '/assets/feather');
    this._appConfig.addIcons(bootstrapIcons, '/assets/bootstrap-icons');

    addIcons({ keyOutline });
  }
  private createFormGroup() {
    this.formGroup = this.fb.group({
      Email_Address: this.fb.control('', [
        Validators.required,
        Validators.pattern(/^$|\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/),
        //Validators.email,
      ]),
    });
  }
  private displayErrorOccurredText() {
    let failedMessageObs = 'DEFAULTS.FAILED';
    let errorOccuredMessageObs = 'DEFAULTS.ERRORS.UNEXPECTED_ERROR_OCCURED';
    this._appConfig.openAlertMessageBox(
      failedMessageObs,
      errorOccuredMessageObs
    );
  }
  private requestForgotPassword(body: { Email_Address: string }) {
    this.loadingService.startLoading().then((loading) => {
      this._apiService
        .sendForgotPasswordLink(body)
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res: { Status: string; OTP_Code: string | null }[]) => {
            if (!res[0].OTP_Code) {
              this._appConfig.openAlertMessageBox(
                'DEFAULTS.WARNING',
                res[0].Status
              );
            } else {
              let message: string = this._tr.instant(
                'FORGOT_PASSWORD.IF_AN_EMAIL_EXISTS_MESSAGE_WILL_BE_SENT'
              );
              message = message.replace('{{}}', this.Email_Address.value);
              const dialogRef = this._appConfig.openStatePanel(
                'success',
                message,
                true
              );
              dialogRef.componentInstance.buttonClicked
                .asObservable()
                .pipe(this.unsubscribe.takeUntilDestroy)
                .subscribe({
                  next: () => {
                    this.router
                      .navigate(['/otp'], {
                        replaceUrl: true,
                        queryParams: {
                          email: btoa(this.Email_Address.value),
                          OTP_Code: btoa(res[0].OTP_Code!),
                        },
                      })
                      .then(() => this.formGroup.reset());
                  },
                });
            }
          },
          error: (err) => {
            console.error(err.message);
            this.displayErrorOccurredText();
          },
        });
    });
  }
  submitForm(event: MouseEvent) {
    if (this.formGroup.valid) {
      this.requestForgotPassword(this.formGroup.value);
    } else {
      this.formGroup.markAllAsTouched();
    }
  }
  get Email_Address() {
    return this.formGroup.get('Email_Address') as FormControl;
  }
}
