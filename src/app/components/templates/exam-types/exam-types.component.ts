import { Component, OnInit } from '@angular/core';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { StudentsManagementService } from 'src/app/services/students-management/students-management.service';
import { Observable } from 'rxjs';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { CommonModule, Location } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatRippleModule } from '@angular/material/core';
import { Router, RouterLink } from '@angular/router';
import { ToBase64Pipe } from 'src/app/pipes/results-marks/results-marks.pipe';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-exam-types',
  templateUrl: './exam-types.component.html',
  styleUrls: ['./exam-types.component.scss'],
  standalone: true,
  imports: [
    MatListModule,
    MatIconModule,
    CommonModule,
    TranslateModule,
    MatRippleModule,
    RouterLink,
    ToBase64Pipe,
  ],
})
export class ExamTypesComponent {
  examTypes$ = this.studentsService.examTypes$.asObservable();
  selectedStudent$!: Observable<GetSDetailStudents>;
  constructor(
    private _appConfig: AppConfigService,
    private studentsService: StudentsManagementService,
    private _unsubscribe: UnsubscribeService,
    private navCtrl: NavController,
    private _tr: TranslateService,
    private router: Router,
    private _location: Location
  ) {
    this.init();
    this.registerIcons();
  }
  private init() {
    const createSelectedStudent = () => {
      this.selectedStudent$ = new Observable((subs) => {
        subs.next(JSON.parse(localStorage.getItem('selectedStudent')!));
        subs.complete();
      });
    };
    createSelectedStudent();
    const subscribeSelectedStudent = (student: GetSDetailStudents) => {
      this.studentsService.requestExamTypes({
        Facility_Reg_Sno: student.Facility_Reg_Sno,
      });
    };
    const backButton = () => {
      const backToLogin = () =>
        this.navCtrl.navigateRoot('/tabs/tab-1/dashboard');
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    this.selectedStudent$.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (selectedStudent) => subscribeSelectedStudent(selectedStudent),
      error: (e) => console.error(e),
    });
    backButton();
  }
  private registerIcons() {
    this._appConfig.addIcons(['chevron-right'], '/assets/bootstrap-icons');
  }
  openResultsList(event: MouseEvent) {
    this._tr
      .get('DASHBOARD_PAGE.LABELS.RESULTS')
      .pipe(this._unsubscribe.takeUntilDestroy)
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
}
