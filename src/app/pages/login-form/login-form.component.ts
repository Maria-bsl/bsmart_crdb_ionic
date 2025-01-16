import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  IonContent,
  IonTitle,
  isPlatform,
  IonButton,
  IonText,
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
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { ApiService } from 'src/app/services/api-service/api.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { FLoginForm } from 'src/app/models/forms/login.model';
import { finalize } from 'rxjs';
import { NavController } from '@ionic/angular/standalone';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  standalone: true,
  imports: [
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
  ],
})
export class LoginFormComponent {
  loginFormGroup!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loadingService: LoadingService,
    private _apiService: ApiService,
    private _appConfig: AppConfigService,
    private _unsubscribe: UnsubscribeService,
    private navCtrl: NavController
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
  private displayFailedToLoginError() {
    let failedMessageObs = 'DEFAULTS.FAILED';
    let errorOccuredMessageObs = 'DEFAULTS.ERRORS.UNEXPECTED_ERROR_OCCURED';
    this._appConfig.openAlertMessageBox(
      failedMessageObs,
      errorOccuredMessageObs
    );
  }
  private registerIcons() {
    let icons = ['person', 'lock'];
    this._appConfig.addIcons(icons, '/assets/google-icons');

    icons = ['eye', 'eye-slash'];
    this._appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
  private loginUser(body: FLoginForm) {
    this.loadingService.startLoading().then((loading) => {
      this._apiService
        .signIn(body)
        .pipe(
          this._unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res: any) => {
            if (Object.prototype.hasOwnProperty.call(res[0], 'status')) {
              let failedMessageObs = 'DEFAULTS.FAILED';
              let incorrectUsernamePasswordMessageObs =
                'LOGIN.LOGIN_FORM.ERRORS.USERNAME_OR_PASSWORD_INCORRECT';

              this._appConfig.openAlertMessageBox(
                failedMessageObs,
                incorrectUsernamePasswordMessageObs
              );
            } else {
              let GetSDetails = JSON.stringify(res[0]);
              localStorage.setItem('GetSDetails', GetSDetails);
              localStorage.setItem('User_Name', body.User_Name);
              localStorage.setItem('Password', body.Password);
              this.navCtrl.navigateForward(['/home']);
            }
          },
          error: (err) => {
            this.displayFailedToLoginError();
          },
        });
    });
  }
  onRegisterClicked(event: MouseEvent) {
    this.router.navigate(['/register'], { replaceUrl: true });
  }
  submitForm(event: MouseEvent) {
    if (this.loginFormGroup.valid) {
      this.loginUser({ ...this.loginFormGroup.value });
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
