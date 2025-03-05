import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { IonContent, IonText } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { MatRippleModule } from '@angular/material/core';
import { MatCardModule } from '@angular/material/card';
import { Router, RouterLink } from '@angular/router';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { DashboardService } from 'src/app/services/dashboard-service/dashboard.service';
import { finalize, Observable, of } from 'rxjs';
import { OverallAttendance } from 'src/app/models/forms/attendance';
import { StudentPendingInvoice } from 'src/app/models/forms/invoices.model';
import { CommonModule } from '@angular/common';
import { AccumulateStudentInvoicePipe } from 'src/app/pipes/accumulate-student-invoice/accumulate-student-invoice.pipe';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { ApiService } from 'src/app/services/api-service/api.service';
import { Platform } from '@ionic/angular/standalone';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import { MatDividerModule } from '@angular/material/divider';

type Module = {
  name: string;
  route: string;
  showBackButton: boolean;
  pageTitle: string;
  icon: string;
};

@Component({
  selector: 'app-dashboard-form',
  templateUrl: './dashboard-form.component.html',
  styleUrls: ['./dashboard-form.component.scss'],
  standalone: true,
  imports: [
    IonText,
    IonContent,
    HeaderSectionComponent,
    TranslateModule,
    MatIconModule,
    MatRippleModule,
    RouterLink,
    MatGridListModule,
    MatCardModule,
    CommonModule,
    AccumulateStudentInvoicePipe,
    MatDividerModule,
  ],
})
export class DashboardFormComponent {
  overallAttendance$: Observable<OverallAttendance[]> =
    this.dashboardService.overallAttendance$.asObservable();
  pendingStudentInvoices$: Observable<StudentPendingInvoice[]> =
    this.dashboardService.pendingStudentInvoices$.asObservable();
  selectedStudent$!: Observable<GetSDetailStudents>;
  private modules: Module[] = [
    {
      name: this._tr.instant('DASHBOARD_PAGE.LABELS.FEES'),
      route: '/tabs/tab-1/fees',
      showBackButton: true,
      pageTitle: this._tr.instant('DASHBOARD_PAGE.LABELS.TIME_TABLE'),
      icon: 'credit-card-2-back-fill',
    },
    {
      name: this._tr.instant('DASHBOARD_PAGE.LABELS.TIME_TABLE'),
      route: '/tabs/tab-1/time-table',
      showBackButton: true,
      pageTitle: this._tr.instant('DASHBOARD_PAGE.LABELS.TIME_TABLE'),
      icon: 'calendar-date-fill',
    },
    {
      name: this._tr.instant('DASHBOARD_PAGE.LABELS.RESULTS'),
      route: '/tabs/tab-1/results',
      showBackButton: true,
      pageTitle: this._tr.instant('DASHBOARD_PAGE.LABELS.RESULTS'),
      icon: 'file-earmark-bar-graph-fill',
    },
    {
      name: this._tr.instant('DASHBOARD_PAGE.LABELS.ATTENDANCE'),
      route: '/tabs/tab-1/attendance',
      showBackButton: true,
      pageTitle: this._tr.instant('DASHBOARD_PAGE.LABELS.ATTENDANCE'),
      icon: 'calendar-check-fill',
    },
    {
      name: this._tr.instant('DASHBOARD_PAGE.LABELS.LIBRARY'),
      route: 'tabs/tab-1/library',
      showBackButton: true,
      pageTitle: this._tr.instant('DASHBOARD_PAGE.LABELS.LIBRARY'),
      icon: 'book-fill',
    },
    {
      name: this._tr.instant('DASHBOARD_PAGE.LABELS.BOOKS'),
      route: 'tabs/tab-1/books',
      showBackButton: true,
      pageTitle: this._tr.instant('DASHBOARD_PAGE.LABELS.BOOKS'),
      icon: 'bookshelf',
    },
    {
      name: this._tr.instant('DASHBOARD_PAGE.LABELS.NOTIFICATIONS'),
      route: '',
      showBackButton: false,
      pageTitle: this._tr.instant('DASHBOARD_PAGE.LABELS.NOTIFICATIONS'),
      icon: 'bell-fill',
    },
    {
      name: this._tr.instant('DASHBOARD_PAGE.LABELS.GET_SUPPORT'),
      route: 'tabs/tab-1/get-support',
      showBackButton: true,
      pageTitle: this._tr.instant('DASHBOARD_PAGE.LABELS.GET_SUPPORT'),
      icon: 'headset',
    },
  ];
  constructor(
    private _appConfig: AppConfigService,
    private router: Router,
    private _tr: TranslateService,
    private unsubscribe: UnsubscribeService,
    private dashboardService: DashboardService,
    private loadingService: LoadingService,
    private apiService: ApiService,
    private platform: Platform
  ) {
    this.registerIcons();
    this.dashboardService.initDashboard();
    this.selectedStudent$ = new Observable((subs) => {
      subs.next(JSON.parse(localStorage.getItem('selectedStudent')!));
      subs.complete();
    });
  }
  private registerIcons() {
    this._appConfig.addIcons(
      [
        'chevron-right',
        'book-fill',
        'calendar-date-fill',
        'file-earmark-bar-graph-fill',
        'bell-fill',
        'calendar-check-fill',
        'headset',
        'bookshelf',
        'credit-card-2-back-fill',
      ],
      `/assets/bootstrap-icons`
    );
    this._appConfig.addIcons(
      [
        'student-person-svgrepo-com',
        'black-and-white-credit-cards-svgrepo-com',
      ],
      `/assets/svgrepo`
    );
    this._appConfig.addIcons(
      [
        'ic_holiday',
        'ic_holiday_blue',
        'fees-vector',
        'ic_holiday_purple',
        'graduate',
        'mandombe',
      ],
      `/assets/figma`
    );
  }
  openFeesPage(event: MouseEvent) {
    this._tr
      .get('DASHBOARD_PAGE.LABELS.SCHOOL_FEES')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/tab-1/fees'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (err) => console.error(err),
      });
  }
  openTimetablePage(event: MouseEvent) {
    this._tr
      .get('DASHBOARD_PAGE.LABELS.TIME_TABLE')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/tab-1/time-table'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (err) => console.error(err),
      });
  }
  openResultsPage(event: MouseEvent) {
    this._tr
      .get('DASHBOARD_PAGE.LABELS.RESULTS')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/tab-1/results'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (e) => console.error(e),
      });
  }
  openAttendancePage(event: MouseEvent) {
    this._tr
      .get('DASHBOARD_PAGE.LABELS.ATTENDANCE')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/tab-1/attendance'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (e) => console.error(e),
      });
  }
  openLibraryPage(event: MouseEvent) {
    this._tr
      .get('DASHBOARD_PAGE.LABELS.LIBRARY')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/tab-1/library'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (e) => console.error(e),
      });
  }
  openBooksPage(event: MouseEvent) {
    this._tr
      .get('DASHBOARD_PAGE.LABELS.BOOKS')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/tab-1/books'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (e) => console.error(e),
      });
  }
  requestEventDetails(event: MouseEvent) {
    this.loadingService
      .startLoading()
      .then((loading) => {
        let body = {
          Facility_Reg_Sno:
            this.dashboardService.selectedStudent.Facility_Reg_Sno,
          Admission_No: this.dashboardService.selectedStudent.Admission_No,
        };
        this.apiService
          .getEventList(body)
          .pipe(
            this.unsubscribe.takeUntilDestroy,
            finalize(() => this.loadingService.dismiss())
          )
          .subscribe({
            next: (res) => {
              if (res && res[0] && res[0].Status === 'No events available') {
                this._appConfig
                  .openAlertMessageBox(
                    'DEFAULTS.INFO',
                    'DASHBOARD_PAGE.ERRORS.NO_EVENTS_AVAILABLE'
                  )
                  .subscribe();
              } else {
                this._appConfig
                  .openAlertMessageBox(
                    'DEFAULTS.WARNING',
                    'DASHBOARD_PAGE.ERRORS.NO_EVENTS_AVAILABLE'
                  )
                  .subscribe();
              }
            },
            error: (err) => console.error('Failed to fetch event details', err),
          });
      })
      .catch((err) => console.error(err));
  }
  openGetSupportPage(event: MouseEvent) {
    this._tr
      .get('DASHBOARD_PAGE.LABELS.GET_SUPPORT')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/tab-1/get-support'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (e) => console.error(e),
      });
  }
  openUpcomingFeesPage(event: MouseEvent) {
    this._tr
      .get('DASHBOARD_PAGE.LABELS.SCHOOL_FEES')
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/tab-1/fees'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
              'is-pending-fee': true,
            },
          });
        },
        error: (err) => console.error(err),
      });
  }
  get modules$() {
    return of(this.modules);
  }
}
