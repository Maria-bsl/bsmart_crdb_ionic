import { CommonModule, Location } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
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
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { downloadOutline } from 'ionicons/icons';
import jsPDF from 'jspdf';
import { firstValueFrom, Observable, switchMap, zip } from 'rxjs';
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
  private async writeAndDownloadReport(
    studentName: string,
    labels: string[],
    element: any,
    ionButton: any
  ) {
    this.loadingService.startLoading().then(async (loading) => {
      let details = await firstValueFrom(this.studentMarks$);
      let doc = new jsPDF(
        element.clientWidth > element.clientHeight ? 'l' : 'p',
        'mm',
        [element.clientWidth, element.clientHeight]
      );
      await this.jsPdfService.exportJsPdfToPdf(
        doc,
        element,
        `${studentName}_marks`.concat('-')
      );
      ionButton.el.classList.remove('hidden');
      let downloadedMessage = this._tr.get(
        'DEFAULTS.FILE_DOWNLOADED_SUCCESSFULLY'
      );
      let viewMessage = this._tr.get('DEFAULTS.VIEW');
      let merged = zip(downloadedMessage, viewMessage);
      merged.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
        next: (messages) => {
          const [msg1, msg2] = messages;
          const uri$ = this.jsPdfService.getFileUri(
            `${studentName}_marks`.concat('-')
          );
          uri$.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
            next: (file) => {
              const fileOpenerOptions: FileOpenerOptions = {
                filePath: file.uri,
                contentType: 'application/pdf',
                openWithDefault: true,
              };
              FileOpener.open(fileOpenerOptions);
            },
            error: (e) => console.error(e),
            complete: () => this.loadingService.dismiss(),
          });
        },
        error: (err) => console.error(err),
      });
    });
  }
  downloadStudentMarks(event: MouseEvent, ionButton: any) {
    ionButton.el.classList.add('hidden');
    const studentName = this._tr.get(
      'RESULTS_PAGE.STUDENT_MARK_DETAIL_REPORT.STUDENT_NAME'
    );
    const finalGrade = this._tr.get(
      'RESULTS_PAGE.STUDENT_MARK_DETAIL_REPORT.FINAL_GRADE'
    );
    const overall = this._tr.get(
      'RESULTS_PAGE.STUDENT_MARK_DETAIL_REPORT.OVERALL'
    );
    const merged = zip(studentName, finalGrade, overall);
    merged.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (results) => {
        this.selectedStudent$
          .pipe(this._unsubscribe.takeUntilDestroy)
          .subscribe({
            next: (selectedStudent) => {
              this.writeAndDownloadReport(
                selectedStudent.SFullName,
                results,
                this.resultsList.nativeElement,
                ionButton
              );
            },
            error: (e) => console.error(e),
          });
      },
      error: (e) => console.error(e),
    });
  }
}
