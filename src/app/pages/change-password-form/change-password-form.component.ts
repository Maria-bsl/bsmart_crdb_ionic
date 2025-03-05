import { Location } from '@angular/common';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import {
  IonIcon,
  IonText,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  NavController,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { toast } from 'ngx-sonner';
import { finalize, Observable, zip } from 'rxjs';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { GetParentDetail } from 'src/app/models/responses/RGetParentDetails';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';

@Component({
  selector: 'app-change-password-form',
  templateUrl: './change-password-form.component.html',
  styleUrls: ['./change-password-form.component.scss'],
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
  ],
})
export class ChangePasswordFormComponent {
  parentDetail$!: Observable<GetParentDetail | null>;
  changePasswordForm!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private _appConfig: AppConfigService,
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private apiService: ApiService,
    private _unsubscribe: UnsubscribeService,
    private router: Router,
    private _location: Location
  ) {
    this.init();
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
  private init() {
    const backButton = () => {
      const backToLogin = () => this.navCtrl.navigateRoot('/tabs/profile');
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
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
  private displayFailedToGetParentDetailsError() {
    let failedMessageObs = 'DEFAULTS.FAILED';
    let errorMessageObs =
      'CHANGE_PASSWORD_FORM.ERRORS.FAILED_TO_GET_PARENT_DETAILS';
    this._appConfig.openAlertMessageBox(failedMessageObs, errorMessageObs);
  }
  private displayFailedChangePasswordError() {
    let failedMessageObs = 'DEFAULTS.FAILED';
    let msgObs = 'CHANGE_PASSWORD_FORM.ERRORS.FAILED_TO_UPDATE_PASSWORD_TEXT';
    this._appConfig.openAlertMessageBox(failedMessageObs, msgObs);
  }
  private getParentDetails(username: string) {
    const createParentDetail = (parentDetail: GetParentDetail | null) => {
      this.parentDetail$ = new Observable((subs) => {
        subs.next(parentDetail);
        subs.complete();
      });
    };
    this.loadingService.startLoading().then((loading) => {
      this.apiService
        .getParentDetails({ User_Name: username })
        .pipe(
          this._unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res: any) => {
            if (Object.prototype.hasOwnProperty.call(res[0], 'Status')) {
              switch (res[0].Status) {
                case 'Parent Details':
                  createParentDetail(res[0]);
                  break;
                case 'UserName not exists':
                default:
                  createParentDetail(null);
                  break;
              }
            } else {
              this.displayFailedToGetParentDetailsError();
            }
          },
          error: (err) => {
            createParentDetail(null);
            this.displayFailedToGetParentDetailsError();
          },
        });
    });
  }
  private changePassword(password: string) {
    this.loadingService.startLoading().then((loading) => {
      let getParentDetailsObs = this.apiService.getParentDetails({
        User_Name: localStorage.getItem('User_Name')!,
      });
      let merged = zip(getParentDetailsObs);
      merged.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
        next: (res: any) => {
          let [details] = res;
          if (Object.prototype.hasOwnProperty.call(details[0], 'Status')) {
            switch (details[0].Status) {
              case 'Parent Details':
                let parentDetail = details[0] as GetParentDetail;
                this.requestChangePassword(
                  parentDetail.Email_Address,
                  password
                );
                break;
              case 'UserName not exists':
              default:
                this.loadingService.dismiss();
                this.displayFailedChangePasswordError();
                break;
            }
          } else {
            this.loadingService.dismiss();
            this.displayFailedChangePasswordError();
          }
        },
        error: (err) => {
          this.displayFailedToGetParentDetailsError();
        },
      });
    });
  }
  private requestChangePassword(email: string, password: string) {
    let form = new Map();
    form.set('Email_Address', email);
    form.set('New_Password', password);
    this.apiService
      .changePassword(Object.fromEntries(form))
      .pipe(
        this._unsubscribe.takeUntilDestroy,
        finalize(() => this.loadingService.dismiss())
      )
      .subscribe({
        next: (res: any) => {
          if (Object.prototype.hasOwnProperty.call(res[0], 'Status')) {
            toast.success(res[0].Status);
            this.router.navigate(['/tabs/tab-1']);
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
      this.changePassword(this.confirmPassword.value);
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
