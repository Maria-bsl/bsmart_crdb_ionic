import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
  WritableSignal,
} from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  Form,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonText } from '@ionic/angular/standalone';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import anime from 'animejs/lib/anime.es.js';
import { transition, trigger } from '@angular/animations';
import { inOutAnimation, slideTo } from 'src/app/shared/fade-in-out-animation';
import { AppConst } from 'src/app/utils/app-const';
import { ApiService } from 'src/app/services/api-service/api.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import {
  BehaviorSubject,
  catchError,
  finalize,
  firstValueFrom,
  map,
  Observable,
  of,
  startWith,
  Subject,
  zip,
} from 'rxjs';
import { RGetFacilities } from 'src/app/models/responses/RGetFacilities';
import { FParentReg } from 'src/app/models/forms/parent-reg.model';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { RegisterAccountInfoService } from 'src/app/services/register-account-info-service/register-account-info.service';
import { StudentDetailsFormService } from 'src/app/services/student-details-form-service/student-details-form.service';
import { isPlatform } from '@ionic/angular/standalone';
import {
  ExternalLinks,
  PackageNames,
} from 'src/app/models/forms/package-names';
import { toast } from 'ngx-sonner';
import { NavController } from '@ionic/angular/standalone';
import { HasFormControlErrorPipe } from 'src/app/pipes/has-form-control-error/has-form-control-error.pipe';

@Component({
  selector: 'app-register-form',
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
  standalone: true,
  imports: [
    IonText,
    TranslateModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatAutocompleteModule,
    CommonModule,
    RouterLink,
    HasFormControlErrorPipe,
  ],
  animations: [inOutAnimation],
})
export class RegisterFormComponent implements OnInit, AfterViewInit {
  formCurrentIndex$: BehaviorSubject<number> = new BehaviorSubject(0);
  constructor(
    public parentRegService: RegisterAccountInfoService,
    public studentRegService: StudentDetailsFormService,
    private loadingService: LoadingService,
    private apiService: ApiService,
    private unsubscribe: UnsubscribeService,
    private _appConfig: AppConfigService,
    private router: Router,
    private tr: TranslateService,
    private navCtrl: NavController
  ) {
    this.backButtonHandler();
    this.studentRegService.requestFacultiesList();
  }
  private backButtonHandler() {
    const backToHome = () => this.navCtrl.navigateRoot('/login');
    this._appConfig.backButtonEventHandler(backToHome);
  }
  private resetForm() {
    this.parentRegService.parentForm.reset();
    this.studentRegService.studentForm.reset();
  }
  private registrationSuccessHandler() {
    const launchEmailApp = () => {
      this.resetForm();
      this.router.navigate(['/login']);
      if (isPlatform('capacitor')) {
        this._appConfig.launchApp(PackageNames.GOOGLE_EMAIL);
      } else {
        this._appConfig.openExternalLink(ExternalLinks.GOOGLE_EMAIL_INBOX);
      }
    };
    let emailText: string = this.tr.instant(
      'REGISTER.REGISTER_FORM.SUCCESS.EMAIL_SENT_TEXT'
    );
    emailText = emailText.replace(
      '{{}}',
      this.parentRegService.Email_Address.value
    );
    const dialogRef = this._appConfig.openStatePanel(
      'success',
      emailText,
      true
    );
    dialogRef.componentInstance.buttonClicked
      .asObservable()
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: () => launchEmailApp(),
      });
  }
  ngOnInit() {}
  ngAfterViewInit(): void {}
  private requestRegisterParent(body: FParentReg) {
    this.loadingService.startLoading().then((loading) => {
      this.apiService
        .registerParent(body)
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (results: any) => {
            let keys = Object.keys(results[0]);
            if (
              keys.includes('Status') &&
              results[0]['Status'].toLocaleLowerCase() ===
                'Successfully registered'.toLocaleLowerCase()
            ) {
              this.registrationSuccessHandler();
            } else if (keys.includes('Status')) {
              let title = 'DEFAULTS.FAILED';
              this._appConfig.openAlertMessageBox(title, results[0]['Status']);
            } else {
              throw Error('Unexpected response parsed.');
            }
          },
          error: (err) => {
            let title = 'DEFAULTS.FAILED';
            let message = 'defaults.errors.somethingWentWrongTryAgain';
            this._appConfig.openAlertMessageBox(title, message);
          },
        });
    });
  }
  private validateRegistrationForm() {
    let errors = { title: 'DEFAULTS.INVALID_FORM', message: '' };
    this.parentRegService.validateForm(errors);
    this.studentRegService.validateForm(errors);
    errors.message
      ? this._appConfig.openAlertMessageBox(errors.title, errors.message)
      : (() => {})();
  }
  submitRegisterForm(event: MouseEvent) {
    const submission = () => {
      const parentDetails = this.parentRegService.getRegisterParentMap();
      const studentDetails = this.studentRegService.getStudentDetailsMap();
      parentDetails.set(
        'SDetails',
        (studentDetails as any[]).map((p) => Object.fromEntries(p))
      );
      this.requestRegisterParent(
        Object.fromEntries(parentDetails) as FParentReg
      );
    };

    if (
      this.parentRegService.parentForm.valid &&
      this.studentRegService.studentForm.valid
    ) {
      submission();
    } else {
      this.validateRegistrationForm();
      this.parentRegService.parentForm.markAllAsTouched();
      this.studentRegService.studentForm.markAllAsTouched();
    }
  }
  nextForm(event: MouseEvent) {
    const currentIndex = this.formCurrentIndex$.value;
    if (currentIndex === 0) {
      const target = document.getElementById(
        `register-form-${currentIndex + 1}`
      );
      target && target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.formCurrentIndex$.next(1);
    } else {
      this.submitRegisterForm(event);
    }
  }
  prevForm(event: MouseEvent) {
    const target = document.getElementById(`register-form-0`);
    target && target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.formCurrentIndex$.next(0);
  }
}
