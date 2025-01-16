import { Injectable } from '@angular/core';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { AttendanceScore } from 'src/app/models/forms/attendance';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import { ApiService } from '../api-service/api.service';
import { AppConfigService } from '../app-config/app-config.service';
import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';
import { LoadingService } from '../loading-service/loading.service';
import { FTimeTableForm as StudentDetailsForm } from 'src/app/models/forms/f-time-table-form';
// import { ApiConfigService } from '../../api-config/api-config.service';
// import { AttendanceScore } from 'src/app/core/types/attendance';
// import { AppConfigService } from '../../app-config/app-config.service';
// import { FTimeTableForm as StudentDetailsForm } from 'src/app/core/forms/f-time-table-form';
// import { GetSDetailStudents } from 'src/app/core/interfaces/GetSDetails';
// import { UnsubscriberService } from '../../unsubscriber/unsubscriber.service';
// import { LoadingService } from '../../loading-service/loading.service';

@Injectable({
  providedIn: 'root',
})
export class AttendancePageService {
  // selectedStudent: GetSDetailStudents = JSON.parse(
  //   localStorage.getItem('selectedStudent')!
  // );
  selectedStudent$!: Observable<GetSDetailStudents>;
  attendanceScore$ = new BehaviorSubject<AttendanceScore[]>([]);
  constructor(
    private apiService: ApiService,
    private appConfig: AppConfigService,
    private unsubscribe: UnsubscribeService,
    private loadingService: LoadingService
  ) {
    this.selectedStudent$ = new Observable((subs) => {
      subs.next(JSON.parse(localStorage.getItem('selectedStudent')!));
      subs.complete();
    });
  }
  requestAttendanceScore() {
    this.selectedStudent$.pipe(this.unsubscribe.takeUntilDestroy).subscribe({
      next: (selectedStudent) => {
        const body: StudentDetailsForm = {
          Facility_Reg_Sno: selectedStudent.Facility_Reg_Sno,
          Admission_No: selectedStudent.Admission_No,
          From_Date: undefined,
          To_Date: undefined,
        };
        this.loadingService.startLoading().then((loading) => {
          this.apiService
            .getAttendanceScore(body)
            .pipe(
              this.unsubscribe.takeUntilDestroy,
              finalize(() => this.loadingService.dismiss())
            )
            .subscribe({
              next: (results) => {
                //console.log(results);
                this.attendanceScore$.next(results);
              },
            });
        });
      },
      error: (e) => console.error(e),
    });
  }
  // requestAttendanceOverall() {
  //   const body: StudentDetailsForm = {
  //     Facility_Reg_Sno: this.selectedStudent.Facility_Reg_Sno,
  //     Admission_No: this.selectedStudent.Admission_No,
  //   };
  //   return this.apiService.getAttendance(body).pipe(
  //     this.unsubscribe.takeUntilDestroy,
  //     finalize(() => this.loadingService.dismiss())
  //   );
  // }
}
