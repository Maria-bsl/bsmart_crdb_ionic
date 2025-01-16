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
import { slideTo } from 'src/app/shared/fade-in-out-animation';
import { AppConst } from 'src/app/utils/app-const';
import { ApiService } from 'src/app/services/api-service/api.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import {
  catchError,
  finalize,
  firstValueFrom,
  map,
  Observable,
  of,
  startWith,
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
  ],
})
export class RegisterFormComponent implements OnInit, AfterViewInit {
  isFirstPartRegister: WritableSignal<boolean> = signal<boolean>(true);
  @ViewChild('firstPartRegister')
  firstPartRegister!: ElementRef<HTMLDivElement>;
  @ViewChild('secondPartRegister')
  secondPartRegister!: ElementRef<HTMLDivElement>;
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
    const swalIsDismissed = () => {
      this.loadingService.startLoading().then((loading) => {
        setTimeout(() => {
          this.resetForm();
          this.loadingService.dismiss();
          this.router.navigate(['/login']);
        }, 800);
      });
    };
    const swalIsConfirmed = () => {
      this.resetForm();
      this.router.navigate(['/login']);
      if (isPlatform('capacitor')) {
        this._appConfig.launchApp(PackageNames.GOOGLE_EMAIL);
      } else {
        this._appConfig.openExternalLink(ExternalLinks.GOOGLE_EMAIL_INBOX);
      }
    };

    const titleObs = this.tr.get(
      'REGISTER.REGISTER_FORM.SUCCESS.SUCCESSFULLY_REGISTERED_TEXT'
    );
    const mailSentObs = this.tr.get(
      'REGISTER.REGISTER_FORM.SUCCESS.EMAIL_SENT_TEXT'
    );
    const openMailObs = this.tr.get(
      'REGISTER.REGISTER_FORM.SUCCESS.OPEN_MAIL_APP'
    );
    const merged = zip(titleObs, mailSentObs, openMailObs);
    merged.subscribe({
      next: (results) => {
        const [title, mailSent, openMail] = results;
        const sent = mailSent.replace(
          '{{}}',
          this.parentRegService.Email_Address.value
        );
        toast.success(mailSent, {
          action: {
            label: sent,
            onClick: () => {
              swalIsConfirmed();
            },
          },
          onDismiss: (t) => {
            swalIsDismissed();
          },
        });
      },
    });
  }
  ngOnInit() {}
  ngAfterViewInit(): void {}
  submitRegisterFormGroup(event: MouseEvent) {
    if (this.isFirstPartRegister()) {
      let t = anime({
        autoplay: false,
        targets: this.firstPartRegister.nativeElement,
        translateX: '-100%',
        duration: 500,
      });
      let y = anime({
        autoplay: false,
        targets: this.secondPartRegister.nativeElement,
        translateX: '0%',
        duration: 500,
      });
      t.play();
      y.play();
      this.isFirstPartRegister.set(false);
    } else {
      let t = anime({
        autoplay: false,
        targets: this.firstPartRegister.nativeElement,
        translateX: '0',
        duration: 500,
      });
      let y = anime({
        autoplay: false,
        targets: this.secondPartRegister.nativeElement,
        translateX: '100%',
        duration: 500,
      });
      t.play();
      y.play();
      this.isFirstPartRegister.set(true);
    }
  }
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
}
