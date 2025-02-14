import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  FileOpenerOptions,
  FileOpener,
} from '@capacitor-community/file-opener';
import {
  IonContent,
  IonButton,
  IonText,
  IonIcon,
  NavController,
  isPlatform,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { downloadOutline } from 'ionicons/icons';
import jsPDF from 'jspdf';
import {
  concatMap,
  endWith,
  finalize,
  firstValueFrom,
  Observable,
  of,
  switchMap,
  tap,
  withLatestFrom,
  zip,
} from 'rxjs';
import { FStudentMarksForm } from 'src/app/models/forms/f-add-student';
import {
  IStudentMarks,
  IStudentMarksDetail,
} from 'src/app/models/forms/StudentMarks';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import {
  AboveAveragePipe,
  BelowAveragePipe,
  GreatAveragePipe,
} from 'src/app/pipes/results-marks/results-marks.pipe';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { JspdfUtilsService } from 'src/app/services/jsdpdf-utils/jspdf-utils.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { StudentsManagementService } from 'src/app/services/students-management/students-management.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';

@Component({
  selector: 'app-pupil-marks',
  templateUrl: './pupil-marks.component.html',
  styleUrls: ['./pupil-marks.component.scss'],
  standalone: true,
  imports: [
    IonText,
    IonContent,
    IonButton,
    IonIcon,
    MatCardModule,
    MatButtonModule,
    AboveAveragePipe,
    BelowAveragePipe,
    GreatAveragePipe,
    TranslateModule,
    CommonModule,
    MatSnackBarModule,
    MatIconModule,
  ],
})
export class PupilMarksComponent {
  @ViewChild('resultsList') resultsList!: ElementRef<HTMLDivElement>;
  selectedStudent$!: Observable<GetSDetailStudents>;
  studentMarks$: Observable<IStudentMarks | null> =
    this.studentsService.studentMarks$.asObservable();
  studentMarksDetails$: Observable<IStudentMarksDetail[] | null> =
    this.studentsService.studentMarksDetails$.asObservable();
  constructor(
    private studentsService: StudentsManagementService,
    private _unsubscribe: UnsubscribeService,
    private activatedRoute: ActivatedRoute,
    private _tr: TranslateService,
    private loadingService: LoadingService,
    private jsPdfService: JspdfUtilsService,
    private _snackBar: MatSnackBar,
    private _appConfig: AppConfigService,
    private navCtrl: NavController,
    private _location: Location
  ) {
    addIcons({ downloadOutline });
    this.init();
    this.registerIcons();
    this.readExamTypeFromActivatedRoute();
  }
  private registerIcons() {
    let icons = ['download'];
    this._appConfig.addIcons(icons, '/assets/bootstrap-icons');
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
        this.navCtrl.navigateRoot('/tabs/tab-1/results');
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
    createSelectedStudent();
  }
  private createStudentMarksForm(
    examType: string,
    selectedStudent: GetSDetailStudents
  ) {
    const form: FStudentMarksForm = {
      Facility_Reg_Sno: selectedStudent.Facility_Reg_Sno.toString(),
      Admission_No: selectedStudent.Admission_No,
      Exam_Type_Sno: examType,
    };
    return form;
  }
  private readExamTypeFromActivatedRoute() {
    this.activatedRoute.params
      .pipe(this._unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (params) => {
          const examType = atob(params['examType']);
          this.selectedStudent$
            .pipe(this._unsubscribe.takeUntilDestroy)
            .subscribe({
              next: (selectedStudent) => {
                const form = this.createStudentMarksForm(
                  examType,
                  selectedStudent
                );
                this.studentsService.requestStudentMarksAndMarksDetails(form);
              },
              error: (e) => console.error(e),
            });
        },
      });
  }
  downloadStudentMarks(event: MouseEvent, ionButton: MatButton) {
    this.loadingService
      .open()
      .pipe(
        this._unsubscribe.takeUntilDestroy,
        switchMap((loading) =>
          this.selectedStudent$.pipe(withLatestFrom(of(loading)))
        ),
        tap(([selectedStudent, loading]) =>
          this.jsPdfService.exportHtml(
            this.resultsList.nativeElement,
            `${selectedStudent.SFullName}_marks`.concat('-')
          )
        ),
        switchMap(([selectedStudent, loading]) =>
          this.jsPdfService.finished$.pipe(
            concatMap((isFinished) =>
              this.jsPdfService
                .getFileUri(`${selectedStudent.SFullName}_marks`.concat('-'))
                .pipe(
                  tap((file) =>
                    FileOpener.open({
                      filePath: file.uri,
                      contentType: 'application/pdf',
                      openWithDefault: true,
                    })
                  ),
                  finalize(() => loading && loading.close())
                )
            )
          )
        )
      )
      .subscribe();
  }
}
