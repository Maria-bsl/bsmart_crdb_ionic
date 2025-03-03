import { Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonIcon,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { load } from 'google-maps';
import { finalize, map, switchMap } from 'rxjs';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';

@Component({
  selector: 'app-reset-password-form',
  templateUrl: './reset-password-form.component.html',
  styleUrls: ['./reset-password-form.component.scss'],
  standalone: true,
  imports: [
    IonIcon,
    IonText,
    IonContent,
    MatToolbarModule,
    IonButtons,
    IonBackButton,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    IonButton,
    ReactiveFormsModule,
    HeaderSectionComponent,
    MatButtonModule,
  ],
})
export class ResetPasswordFormComponent {
  changePasswordForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private _appConfig: AppConfigService,
    private loadingService: LoadingService,
    private apiService: ApiService,
    private _unsubscribe: UnsubscribeService,
    private activatedRoute$: ActivatedRoute,
    private router: Router
  ) {
    this.createChangePasswordFormGroup();
  }
  private matchValidator(matchTo: string, reverse?: boolean): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (control.parent && reverse) {
        const c = (control.parent?.controls as any)[matchTo] as AbstractControl;
        if (c) {
          c.updateValueAndValidity();
        }
        return null;
      }
      return !!control.parent &&
        !!control.parent.value &&
        control.value === (control.parent?.controls as any)[matchTo].value
        ? null
        : { matching: true };
    };
  }
  private createChangePasswordFormGroup() {
    this.changePasswordForm = this.fb.group({
      currentPassword: this.fb.control('12345678', [Validators.required]),
      newPassword: this.fb.control('', [
        Validators.required,
        this.matchValidator('confirmPassword', true),
      ]),
      confirmPassword: this.fb.control('', [
        Validators.required,
        this.matchValidator('newPassword'),
      ]),
    });
    this.currentPassword.disable();
  }
  private displayFailedChangePasswordError() {
    let failedMessageObs = 'DEFAULTS.FAILED';
    let msgObs = 'CHANGE_PASSWORD_FORM.ERRORS.FAILED_TO_UPDATE_PASSWORD_TEXT';
    this._appConfig.openAlertMessageBox(failedMessageObs, msgObs);
  }
  private requestChangePassword(form: {
    Email_Address: string;
    New_Password: string;
  }) {
    const successResetPassword = (successText: string) => {
      const dialogRef = this._appConfig.openStatePanel(
        'success',
        successText,
        true
      );
      dialogRef.componentInstance.buttonClicked
        .asObservable()
        .pipe(this._unsubscribe.takeUntilDestroy)
        .subscribe({
          next: () => {
            this.changePasswordForm.reset();
            this.router.navigate(['/login']);
          },
        });
    };
    this.loadingService
      .open()
      .pipe(
        switchMap((loading) =>
          this.apiService.changePassword(form).pipe(
            this._unsubscribe.takeUntilDestroy,
            finalize(() => loading.close()),
            filterNotNull()
          )
        )
      )
      .subscribe({
        next: (res) => {
          if (Object.prototype.hasOwnProperty.call(res[0], 'Status')) {
            successResetPassword(res[0].Status);
          } else {
            this.displayFailedChangePasswordError();
          }
        },
        error: (err) => {
          this.displayFailedChangePasswordError();
        },
      });
  }
  submitChangePasswordForm(event: MouseEvent) {
    if (this.changePasswordForm.valid) {
      this.activatedRoute$.queryParamMap
        .pipe(map((value) => atob(value.get('email')!)))
        .subscribe({
          next: (email) => {
            this.requestChangePassword({
              New_Password: this.newPassword.value,
              Email_Address: email!,
            });
          },
        });
    } else {
      this.changePasswordForm.markAllAsTouched();
    }
  }
  get currentPassword() {
    return this.changePasswordForm.get('currentPassword') as FormControl;
  }
  get newPassword() {
    return this.changePasswordForm.get('newPassword') as FormControl;
  }
  get confirmPassword() {
    return this.changePasswordForm.get('confirmPassword') as FormControl;
  }
}
