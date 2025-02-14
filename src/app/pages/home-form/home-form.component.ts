import {
  AfterViewChecked,
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import {
  GetSDetails,
  GetSDetailsErrorStatus,
  GetSDetailStudents,
} from 'src/app/models/responses/RGetSDetails';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  firstValueFrom,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  take,
  tap,
  zip,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { RParentDetail } from 'src/app/models/responses/RParentDetails';
import { FLoginForm } from 'src/app/models/forms/login.model';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { MatRippleModule } from '@angular/material/core';
import { NavController } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { MatDialogRef } from '@angular/material/dialog';
import { ConfirmMessageBoxComponent } from 'src/app/components/dialogs/confirm-message-box/confirm-message-box.component';
import { FDeleteStudent } from 'src/app/models/forms/parent-reg.model';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { toast } from 'ngx-sonner';
import { IonButton } from '@ionic/angular/standalone';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { Platform } from '@ionic/angular/standalone';
import { StudentDetailsFormService } from 'src/app/services/student-details-form-service/student-details-form.service';
import { App } from '@capacitor/app';
import anime from 'animejs/lib/anime.es.js';

@Component({
  selector: 'app-home-form',
  templateUrl: './home-form.component.html',
  styleUrls: ['./home-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    TranslateModule,
    MatToolbarModule,
    MatIconModule,
    MatRippleModule,
    MatButtonModule,
    MatProgressBarModule,
    CommonModule,
    IonButton,
    HeaderSectionComponent,
  ],
})
export class HomeFormComponent implements AfterViewInit, AfterViewChecked {
  studentDetails$!: Observable<GetSDetails>;
  carouselAtStudent$!: BehaviorSubject<number>;
  @ViewChild('carousel') carouselRef!: ElementRef<HTMLDivElement>;
  @ViewChildren('studentCard') studentCards!: QueryList<ElementRef>;
  previousCount = 0;
  constructor(
    private loadingService: LoadingService,
    private apiService: ApiService,
    private _appConfig: AppConfigService,
    private unsubscribe: UnsubscribeService,
    private navCtrl: NavController,
    private router: Router,
    private tr: TranslateService,
    private platform: Platform,
    private studentsService: StudentDetailsFormService
  ) {
    this.init();
  }
  private init() {
    this.registerIcons();
    const backButton = () => {
      const backToLogin = () => new Promise((r, j) => r(console.log));
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
    this.getDetails({
      User_Name: localStorage.getItem('User_Name')!,
      Password: localStorage.getItem('Password')!,
    });
    this.studentsService.addedStudent$
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (res) => {
          this.getDetails({
            User_Name: localStorage.getItem('User_Name')!,
            Password: localStorage.getItem('Password')!,
          });
        },
        error: (e) => console.error(e),
      });
    //backButton();
  }
  private registerIcons() {
    const icons = ['box-arrow-right', 'trash', 'plus-lg', 'eye'];
    this._appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
  private getDetails(body: FLoginForm) {
    const assignDetails = (details: GetSDetails) => {
      details.Students.reverse();
      return details;
    };
    this.studentDetails$ = this.loadingService
      .open()
      .pipe(
        this.unsubscribe.takeUntilDestroy,
        switchMap((loading) =>
          this.apiService.signIn(body).pipe(
            finalize(() => loading && loading.close()),
            catchError(async () => {})
          )
        )
      )
      .pipe(
        filterNotNull(),
        filter(
          (data) => !Object.prototype.hasOwnProperty.call(data[0], 'status')
        ),
        map((data) => assignDetails(data[0] as GetSDetails)),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }
  private requestRemoveStudent(body: FDeleteStudent) {
    this.loadingService.startLoading().then((loading) => {
      this.apiService
        .deleteStudent(body)
        .pipe(this.unsubscribe.takeUntilDestroy)
        .subscribe({
          next: (result) => {
            let keys = Object.keys(result[0]);
            if (keys.includes('Status') && result[0]['Status'] === 'Deleted') {
              // let text = await firstValueFrom(
              //   this.tr.get('HOME_PAGE.LABELS.DELETED_STUDENT_SUCCESSFULLY')
              // );
              // toast.success(text);
              // this.getDetails({
              //   User_Name: localStorage.getItem('User_Name')!,
              //   Password: localStorage.getItem('Password')!,
              // });
              const dialogRef = this._appConfig.openStatePanel(
                'success',
                'HOME_PAGE.LABELS.DELETED_STUDENT_SUCCESSFULLY'
              );
              dialogRef
                .afterClosed()
                .pipe(this.unsubscribe.takeUntilDestroy)
                .subscribe({
                  next: () => {
                    this.getDetails({
                      User_Name: localStorage.getItem('User_Name')!,
                      Password: localStorage.getItem('Password')!,
                    });
                  },
                });
            } else {
              // let text = await firstValueFrom(
              //   this.tr.get('HOME_PAGE.LABELS.FAILED_TO_DELETE_STUDENT')
              // );
              // toast.error(text);
            }
            this.loadingService.dismiss();
          },
          error: (err) => {
            this.loadingService.dismiss();
          },
          complete: () => this.loadingService.dismiss(),
        });
    });
  }
  private animateItems() {
    anime({
      targets: this.studentCards.toArray().map((el) => el.nativeElement),
      opacity: [0, 1],
      translateY: [-40, 0],
      easing: 'easeOutQuad',
      duration: 500,
      delay: (el, i) => i * 100,
    });
  }
  ngAfterViewInit(): void {
    this.animateItems();
    this.previousCount = this.studentCards.length;
  }
  ngAfterViewChecked(): void {
    if (this.studentCards.length > this.previousCount) {
      this.animateItems();
      this.previousCount = this.studentCards.length;
    }
  }
  removeStudent(event: MouseEvent, student: GetSDetailStudents | undefined) {
    if (!student) return;
    const removeConfirmed = (
      dialogRef: MatDialogRef<ConfirmMessageBoxComponent, any>
    ) => {
      const payload$ = dialogRef.componentInstance.confirmed
        .asObservable()
        .pipe(
          map(() => {
            return {
              Facility_Reg_Sno: student?.Facility_Reg_Sno,
              User_Name: student?.User_Name,
              Admission_No: student?.Admission_No,
              Reason_Del: 'Parent Deleted Account',
            } as FDeleteStudent;
          })
        );
      payload$
        .pipe(this.unsubscribe.takeUntilDestroy)
        .subscribe((body) => this.requestRemoveStudent(body));
    };
    const dialogRef$ = this._appConfig.openConfirmMessageBox(
      'HOME_PAGE.LABELS.DELETE_STUDENT',
      'DEFAULTS.THIS_CANT_BE_UNDONE'
    );
    dialogRef$.subscribe({
      next: (dialogRef) => removeConfirmed(dialogRef),
    });
  }
  openStudentDashboard(event: MouseEvent, student: GetSDetailStudents) {
    localStorage.setItem('selectedStudent', JSON.stringify(student));
    this.router.navigate(['/tabs/tab-1/dashboard'], { replaceUrl: true });
  }
  openAddStudentForm(event: MouseEvent) {
    this.tr
      .get('ADD_STUDENT_PAGE.TITLE')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.navCtrl.navigateForward('/add-student', {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (err) => console.error(err),
      });
  }
  openPackagePage(event: MouseEvent) {
    this.tr
      .get('LATEST_SUBSCRIPTIONS_PAGE.LABELS.SUBSCRIPTION_PLANS')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.navCtrl.navigateForward('/package', {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (err) => console.error(err),
      });
  }
}
