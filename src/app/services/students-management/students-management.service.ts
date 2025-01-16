import { Injectable } from '@angular/core';
import { AppConfigService } from '../app-config/app-config.service';
import { BehaviorSubject, finalize, Observable, Subject, zip } from 'rxjs';
import { Router } from '@angular/router';
import { LoadingService } from '../loading-service/loading.service';
import { FExamType, IExamType } from 'src/app/models/forms/ExamType';
import { FTimeTableForm } from 'src/app/models/forms/f-time-table-form';
import { GetTimeTable } from 'src/app/models/forms/GetTimeTable';
import {
  IStudentMarks,
  IStudentMarksDetail,
} from 'src/app/models/forms/StudentMarks';
import { ApiService } from '../api-service/api.service';
import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';
import { FStudentMarksForm } from 'src/app/models/forms/f-add-student';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StudentsManagementService {
  timeTable$ = new BehaviorSubject<GetTimeTable | null>(null);
  examTypes$ = new Subject<IExamType[]>();
  studentMarks$ = new BehaviorSubject<IStudentMarks | null>(null);
  studentMarksDetails$ = new BehaviorSubject<IStudentMarksDetail[] | null>([]);
  constructor(
    private appConfig: AppConfigService,
    private apiConfig: ApiService,
    private unsubscribe: UnsubscribeService,
    private loadingService: LoadingService,
    private router: Router,
    private loc: Location
  ) {}
  private displayFailedToFetchTimeTableError() {
    let failedMessageObs = 'DEFAULTS.FAILED';
    let errorOccuredMessageObs =
      'TIME_TABLE_PAGE.ERRORS.FAILED_TO_FETCH_TIME_TABLE';
    this.appConfig.openAlertMessageBox(
      failedMessageObs,
      errorOccuredMessageObs
    );
  }
  private displayFailedToFetchExamTypes() {
    let failedMessageObs = 'DEFAULTS.FAILED';
    let errorOccuredMessageObs =
      'RESULTS_PAGE.ERRORS.FAILED_TO_FETCH_EXAM_TYPE';
    this.appConfig.openAlertMessageBox(
      failedMessageObs,
      errorOccuredMessageObs
    );
  }
  private failedToFindStudentMarks() {
    let failedMessageObs = 'DEFAULTS.FAILED';
    let errorOccuredMessageObs =
      'RESULTS_PAGE.ERRORS.FAILED_TO_FIND_STUDENT_MARK';
    this.appConfig.openAlertMessageBox(
      failedMessageObs,
      errorOccuredMessageObs
    );
  }
  private noExamResultsFoundError() {
    let failedMessageObs = 'DEFAULTS.WARNING';
    let errorOccuredMessageObs = 'RESULTS_PAGE.ERRORS.NO_EXAM_RESULTS_FOUND';
    this.appConfig.openAlertMessageBox(
      failedMessageObs,
      errorOccuredMessageObs
    );
  }
  requestTimeTable(form: FTimeTableForm) {
    this.loadingService.startLoading().then((loading) => {
      this.apiConfig
        .getTimeTable(form)
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res: any) => {
            if (res && res.length > 0) {
              this.timeTable$.next(res[0]);
            }
          },
          error: (err) => {
            this.displayFailedToFetchTimeTableError();
          },
        });
    });
  }
  requestExamTypes(body: FExamType) {
    this.loadingService.startLoading().then((loading) => {
      this.apiConfig
        .getExamTypes(body)
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res: any) => {
            if (res && res.length > 0) {
              this.examTypes$.next(res);
            } else {
              this.displayFailedToFetchExamTypes();
            }
          },
          error: (err) => {
            this.displayFailedToFetchExamTypes();
          },
        });
    });
  }
  requestStudentMarksAndMarksDetails(body: FStudentMarksForm) {
    this.loadingService.startLoading().then((loading) => {
      let studentMarksObs = this.apiConfig.getStudentMarks(body);
      let studentMarkDetails = this.apiConfig.getStudentMarkDetails(body);
      let marksReq = zip(studentMarksObs, studentMarkDetails);
      marksReq
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (results) => {
            let [marks, marksDetails] = results;
            if (marks && (marks as any[]).length > 0) {
              this.studentMarks$.next((marks as any[])[0] as IStudentMarks);
            }
            if (marksDetails && (marksDetails as any[]).length > 0) {
              this.studentMarksDetails$.next(
                marksDetails as any[] as IStudentMarksDetail[]
              );
            }
            if (
              !marks ||
              (marks as any[]).length === 0 ||
              !marksDetails ||
              (marksDetails as any[]).length === 0
            ) {
              this.noExamResultsFoundError();
              this.studentMarks$.next(null);
              this.studentMarksDetails$.next(null);
            }
          },
          error: (err) => {
            this.failedToFindStudentMarks();
          },
        });
    });
  }
}
