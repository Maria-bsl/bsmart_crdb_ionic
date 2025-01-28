import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { IonContent } from '@ionic/angular/standalone';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { IonText, NavController } from '@ionic/angular/standalone';
import { MatDividerModule } from '@angular/material/divider';
import {
  AvailableWeekdaysPipe,
  ScheduleTypePipe,
  PeriodScheduleTypePipe,
  BreakScheduleTypePipe,
  SwahiliDayOfWeek,
} from 'src/app/pipes/time-table/time-table.pipe';
import { CommonModule, Location } from '@angular/common';
import { Observable } from 'rxjs';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { StudentsManagementService } from 'src/app/services/students-management/students-management.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';

@Component({
  selector: 'app-timetable-form',
  templateUrl: './timetable-form.component.html',
  styleUrls: ['./timetable-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonText,
    HeaderSectionComponent,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatTabsModule,
    MatCardModule,
    MatDividerModule,
    MatListModule,
    ReactiveFormsModule,
    TranslateModule,
    AvailableWeekdaysPipe,
    ScheduleTypePipe,
    PeriodScheduleTypePipe,
    BreakScheduleTypePipe,
    SwahiliDayOfWeek,
    CommonModule,
  ],
})
export class TimetableFormComponent {
  timeTableFormGroup!: FormGroup;
  selectedStudent$!: Observable<GetSDetailStudents>;
  timeTable$ = this.studentsService.timeTable$.asObservable();
  constructor(
    private _appConfig: AppConfigService,
    private navCtrl: NavController,
    private studentsService: StudentsManagementService,
    private _unsubscribe: UnsubscribeService,
    private fb: FormBuilder,
    private _location: Location
  ) {
    this.init();
    this.createTimeTaleFormGroup();
    this.studentsService.requestTimeTable(this.timeTableFormGroup.value);
  }
  private init() {
    const createSelectedStudent = () => {
      this.selectedStudent$ = new Observable((subs) => {
        subs.next(JSON.parse(localStorage.getItem('selectedStudent')!));
        subs.complete();
      });
    };
    const backButton = () => {
      const backToLogin = () =>
        this.navCtrl.navigateRoot('/tabs/tab-1/dashboard');
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    createSelectedStudent();
    backButton();
  }
  private createTimeTaleFormGroup() {
    const getTimeTableInitialToDate = (selectedStudent: GetSDetailStudents) => {
      let yyyyRegex = /^\d{4}$/;
      let yyyyToYyyyRegex = /^\d{4}-\d{4}$/;
      let academicYear = -1;
      if (yyyyRegex.test(selectedStudent.Acad_Year)) {
        academicYear = Number(selectedStudent.Acad_Year);
      } else if (yyyyToYyyyRegex.test(selectedStudent.Acad_Year)) {
        let year = selectedStudent.Acad_Year.substring(
          selectedStudent.Acad_Year.indexOf('-') + 1
        );
        academicYear = Number(year);
      } else {
        throw Error('Academic Year does not match format');
      }
      return new Date(academicYear, 10, 17);
    };
    const createFormGroup = (selectedStudent: GetSDetailStudents) => {
      this.timeTableFormGroup = this.fb.group({
        Facility_Reg_Sno: this.fb.control(
          selectedStudent.Facility_Reg_Sno.toString(),
          []
        ),
        Admission_No: this.fb.control(
          selectedStudent.Admission_No.toString(),
          []
        ),
        From_Date: this.fb.control('', []),
        To_Date: this.fb.control(
          getTimeTableInitialToDate(selectedStudent),
          []
        ),
      });
    };
    this.selectedStudent$.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (selectedStudent) => createFormGroup(selectedStudent),
      error: (e) => console.error(e),
    });
  }
  submitTimeTableForm(event: MouseEvent) {
    if (this.timeTableFormGroup.valid) {
      this.studentsService.requestTimeTable(this.timeTableFormGroup.value);
    } else {
      this.timeTableFormGroup.markAllAsTouched();
    }
  }
  get Facility_Reg_Sno() {
    return this.timeTableFormGroup.get('Facility_Reg_Sno') as FormControl;
  }
  get Admission_No() {
    return this.timeTableFormGroup.get('Admission_No') as FormControl;
  }
  get From_Date() {
    return this.timeTableFormGroup.get('From_Date') as FormControl;
  }
  get To_Date() {
    return this.timeTableFormGroup.get('To_Date') as FormControl;
  }
}
