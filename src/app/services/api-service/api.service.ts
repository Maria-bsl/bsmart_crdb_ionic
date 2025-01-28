import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  catchError,
  map,
  mergeMap,
  Observable,
  retryWhen,
  switchMap,
  throwError,
  timer,
} from 'rxjs';
import { RGetFacilities } from 'src/app/models/responses/RGetFacilities';
import { RGetToken } from 'src/app/models/responses/RGetToken';
import { environment } from 'src/environments/environment.prod';
import { AppConfigService } from '../app-config/app-config.service';
import {
  FDeleteStudent,
  FParentReg,
  IParentDetail,
  IUpdateParentReg,
} from 'src/app/models/forms/parent-reg.model';
import { FLoginForm } from 'src/app/models/forms/login.model';
import {
  GetSDetails,
  GetSDetailsErrorStatus,
} from 'src/app/models/responses/RGetSDetails';
import { RParentDetail } from 'src/app/models/responses/RParentDetails';
import {
  FBookForm,
  FTimeTableForm,
  FTimeTableForm as StudentDetailsForm,
} from 'src/app/models/forms/f-time-table-form';
import {
  StudentInvoice,
  StudentPendingInvoice,
} from 'src/app/models/forms/invoices.model';
import { OverallAttendance } from 'src/app/models/forms/attendance';
import { FExamType } from 'src/app/models/forms/ExamType';
import { FStudentMarksForm } from 'src/app/models/forms/f-add-student';
import { ISubject, ISubjectBook } from 'src/app/models/forms/isubjects';
import { RouteDetail, VehicleDetail } from 'src/app/models/forms/transports';
import { IPackage } from 'src/app/models/forms/package.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  constructor(private _http: HttpClient, private appConfig: AppConfigService) {}
  private createHttpHeaders(headers: Map<string, string>) {
    let heads = new HttpHeaders();
    for (const [key, value] of headers) {
      heads = heads.set(key, value);
    }
    return heads;
  }
  private post<T>(url: string, body: T, headers: Map<string, string>) {
    return this._http
      .post(`${environment.baseUrl}${url}`, body, {
        headers: this.createHttpHeaders(headers),
      })
      .pipe(
        retryWhen((errors) =>
          errors.pipe(
            mergeMap((err, index) => {
              if (index < 3) {
                const delay = 500;
                return timer(delay);
              }
              return throwError(() => err);
            })
          )
        )
      ) as Observable<any>;
  }
  private performPost<T>(url: string, body: T, headers: Map<string, string>) {
    return this.post(url, body, headers).pipe(
      catchError((err) => {
        throw err;
      })
    );
    // return this.post(url, body, headers).pipe(
    //   catchError((err: any) => {
    //     const INVALID_TOKEN_STATUS_CODE = 649;
    //     const errMsg = err.error.StatusCode ? err.error.StatusCode : -1;
    //     if (errMsg === INVALID_TOKEN_STATUS_CODE) {
    //       return this.GetToken().pipe(
    //         switchMap((tokens) => {
    //           this.appConfig.sessionTokens = tokens;
    //           return this.post(url, body, headers).pipe(
    //             catchError((err) => {
    //               throw err;
    //             })
    //           );
    //         })
    //       );
    //     }
    //     throw err;
    //   })
    // );
  }
  GetFacilities(body: {}): Observable<RGetFacilities[]> {
    const url = '/SchoolDetails/GetFacilities';
    return this.performPost(url, body, new Map());
  }
  addStudent(body: FParentReg) {
    const url = '/SchoolDetails/AddStudent';
    return this.performPost(url, body, new Map());
  }
  registerParent(body: FParentReg) {
    const url = `/SchoolDetails/ParentReg`;
    return this.performPost(url, body, new Map());
  }
  sendForgotPasswordLink(body: { Email_Address: string }) {
    const url = `/SchoolDetails/ForgotPassword`;
    return this.performPost(url, body, new Map());
  }
  signIn(
    body: FLoginForm
  ): Observable<GetSDetails[] | GetSDetailsErrorStatus[]> {
    const url = `/SchoolDetails/GetSDetails`;
    return this.performPost(url, body, new Map());
  }
  getParentDetails(body: { User_Name: string }): Observable<RParentDetail[]> {
    const url = `/SchoolDetails/GetParentDet`;
    return this.performPost(url, body, new Map());
  }
  deleteStudent(body: FDeleteStudent) {
    const url = `/SchoolDetails/DeleteStudent`;
    return this.performPost(url, body, new Map());
  }
  getStudentInvoices(body: StudentDetailsForm): Observable<StudentInvoice[]> {
    const url = `/SchoolDetails/GetStudentInvoices`;
    return this.performPost(url, body, new Map());
  }
  getStudentPendingInvoices(
    body: StudentDetailsForm
  ): Observable<StudentPendingInvoice[]> {
    const url = `/SchoolDetails/GetStudentPendingInvoices`;
    return this.performPost(url, body, new Map());
  }
  getStudentPaidInvoices(body: StudentDetailsForm) {
    const url = `/SchoolDetails/GetStudentPaidInvoices`;
    return this.performPost(url, body, new Map());
  }
  getAttendance(body: StudentDetailsForm): Observable<OverallAttendance[]> {
    const url = `/SchoolDetails/GetAttendance`;
    return this.performPost(url, body, new Map());
  }
  getTimeTable(body: FTimeTableForm) {
    const url = `/SchoolDetails/GetTimeTable`;
    return this.performPost(url, body, new Map());
  }
  getExamTypes(body: FExamType) {
    const url = `/SchoolDetails/GetExamTypes`;
    return this.performPost(url, body, new Map());
  }
  getStudentMarks(body: FStudentMarksForm) {
    const url = `/SchoolDetails/GetStudentMarks`;
    return this.performPost(url, body, new Map());
  }
  getStudentMarkDetails(body: FStudentMarksForm) {
    const url = `/SchoolDetails/GetStudentMarks_Details`;
    return this.performPost(url, body, new Map());
  }
  getAttendanceScore(body: StudentDetailsForm) {
    const url = `/SchoolDetails/GetStudentAttendance`;
    return this.performPost(url, body, new Map());
  }
  getBooksReturned(body: FBookForm) {
    const url = `/SchoolDetails/GetR_Books`;
    return this.performPost(url, body, new Map());
  }
  getBooksBorrowed(body: FBookForm) {
    const url = `/SchoolDetails/GetB_Books`;
    return this.performPost(url, body, new Map());
  }
  getBooksList(body: {
    Facility_Reg_Sno: number | string;
  }): Observable<ISubject[]> {
    const url = `/SchoolDetails/GetBooks`;
    return this.performPost(url, body, new Map());
  }
  getBookDetailsList(body: {
    Facility_Reg_Sno: number | string;
    Subject_Sno: number | string;
  }): Observable<ISubjectBook[]> {
    const url = `/SchoolDetails/GetBooksDetails`;
    return this.performPost(url, body, new Map());
  }
  getEventList(body: StudentDetailsForm) {
    const url = `/SchoolDetails/GetEventDetails`;
    return this.performPost(url, body, new Map());
  }
  getRoute(body: StudentDetailsForm): Observable<VehicleDetail[]> {
    const url = `/SchoolDetails/GetRoute`;
    return this.performPost(url, body, new Map());
  }
  getRouteDetails(body: {
    Facility_Reg_Sno: number | string;
    Route_ID: string;
  }): Observable<RouteDetail[]> {
    const url = `/SchoolDetails/GetRouteDetails`;
    return this.performPost(url, body, new Map());
  }
  getUpdateParentDetail(body: IUpdateParentReg): Observable<IParentDetail[]> {
    const url = `/SchoolDetails/UpdateParentReg`;
    return this.performPost(url, body, new Map());
  }
  changePassword(body: { Email_Address: string; New_Password: string }) {
    const url = `/SchoolDetails/ChangePassword_E`;
    return this.performPost(url, body, new Map());
  }
  getPackagePriceList(body: {}): Observable<IPackage[]> {
    const url = `/SchoolDetails/GetPackagePrice`;
    return this.performPost(url, body, new Map());
  }
  getPackageHistoryList(body: { User_Name: string }): Observable<IPackage[]> {
    const url = `/SchoolDetails/GetPackageHistory`;
    return this.performPost(url, body, new Map());
  }
  GetToken(): Observable<RGetToken> {
    let { username, password } = {
      username: 'Nmb001user',
      password: 'NMB@378139',
    };
    let basicAuth = btoa(`${username}:${password}`);
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Basic ${basicAuth}`,
    } as any;
    return this.performPost(
      `/SchoolDetails/GetToken`,
      {},
      new Map(Object.entries(headers))
    );
  }
}
