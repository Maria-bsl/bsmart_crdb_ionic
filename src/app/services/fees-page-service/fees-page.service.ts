import { Injectable } from '@angular/core';
// import { ApiConfigService } from '../../api-config/api-config.service';
// import { FTimeTableForm as StudentDetailsForm } from 'src/app/core/forms/f-time-table-form';
// import { GetSDetailStudents } from 'src/app/core/interfaces/GetSDetails';
import {
  BehaviorSubject,
  distinctUntilChanged,
  filter,
  finalize,
  merge,
  switchMap,
  tap,
  zip,
} from 'rxjs';
import {
  StudentInvoice,
  StudentPendingInvoice,
  StudentPaidInvoice,
} from 'src/app/models/forms/invoices.model';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import { LoadingService } from '../loading-service/loading.service';
import { ApiService } from '../api-service/api.service';
import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';
import { FTimeTableForm as StudentDetailsForm } from 'src/app/models/forms/f-time-table-form';

//import { UnsubscriberService } from '../../unsubscriber/unsubscriber.service';
// import {
//   StudentInvoice,
//   StudentPaidInvoice,
//   StudentPendingInvoice,
// } from 'src/app/core/types/student-invoices';
// import { LoadingService } from '../../loading-service/loading.service';

@Injectable({
  providedIn: 'root',
})
export class FeesPageService {
  studentInvoices$ = new BehaviorSubject<StudentInvoice[]>([]);
  studentPendingInvoices$ = new BehaviorSubject<StudentPendingInvoice[]>([]);
  studentPaidInvoice$ = new BehaviorSubject<StudentPaidInvoice[]>([]);
  constructor(
    private apiService: ApiService,
    private unsubscribe: UnsubscribeService,
    private loadingService: LoadingService
  ) {}
  private requestStudentFees(body: StudentDetailsForm) {
    this.loadingService.startLoading().then((loading) => {
      this.apiService
        .getStudentInvoices(body)
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          tap((invoices) => this.studentInvoices$.next(invoices)),
          switchMap((invoices) =>
            this.apiService.getStudentPendingInvoices(body)
          ),
          tap((pending) => this.studentPendingInvoices$.next(pending)),
          switchMap((pending) => this.apiService.getStudentPaidInvoices(body)),
          tap((paid) => this.studentPaidInvoice$.next(paid)),
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe((val) => {});
    });
  }
  initFeesPage() {
    const selectedStudent: GetSDetailStudents = JSON.parse(
      localStorage.getItem('selectedStudent')!
    );
    const body: StudentDetailsForm = {
      Facility_Reg_Sno: selectedStudent.Facility_Reg_Sno,
      Admission_No: selectedStudent.Admission_No,
      From_Date: undefined,
      To_Date: undefined,
    };
    this.requestStudentFees(body);
  }
}
