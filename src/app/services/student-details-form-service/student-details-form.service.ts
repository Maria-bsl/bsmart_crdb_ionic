import { Injectable, Input } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { finalize, map, Observable, of, startWith, switchMap } from 'rxjs';
import { AppConfigService } from '../app-config/app-config.service';
import { toast } from 'ngx-sonner';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { LoadingService } from '../loading-service/loading.service';
import { NavController } from '@ionic/angular/standalone';
import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';
import { ApiService } from '../api-service/api.service';
import { FParentReg } from 'src/app/models/forms/parent-reg.model';
import { RGetFacilities } from 'src/app/models/responses/RGetFacilities';

@Injectable({
  providedIn: 'root',
})
export class StudentDetailsFormService {
  private faculties: RGetFacilities[] = [];
  filteredFacultiesOptions$: Observable<RGetFacilities[]> = of();
  studentForm: FormGroup = this.fb.group({
    SDetails: this.fb.array(
      [
        this.fb.group({
          Admission_No: this.fb.control<string>('', [Validators.required]),
          Facility_Reg_Sno: this.fb.control<string>('', []),
          SearchFacility: this.fb.control<string>('', {
            validators: [Validators.required, this.isInvalidFacultyName()],
          }),
        }),
      ],
      []
    ),
  });
  constructor(
    private fb: FormBuilder,
    private unsubscribe: UnsubscribeService,
    private appConfig: AppConfigService,
    //private apiService: ApiConfigService,
    private apiService: ApiService,
    private tr: TranslateService,
    private loadingService: LoadingService,
    private navCtrl: NavController
  ) {}
  private isInvalidFacultyName(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      let found = this.faculties.find(
        (faculty) =>
          faculty.Facility_Name.toLocaleLowerCase() ===
          control.value.toLocaleLowerCase()
      );
      return found ? null : { invalidFacultyName: true };
    };
  }
  private requestAddStudent(body: FParentReg) {
    this.loadingService.startLoading().then((loading) => {
      this.apiService
        .addStudent(body)
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (results: any) => {
            let keys = Object.keys(results[0]);
            if (
              keys.includes('Status') &&
              results[0]['Status'].toLocaleLowerCase() ===
                'Successfully added'.toLocaleLowerCase()
            ) {
              let tr = this.tr.get(
                'ADD_STUDENT_PAGE.SUCCESS.SUCCESS_ADD_STUDENT'
              );
              tr.pipe(this.unsubscribe.takeUntilDestroy).subscribe({
                next: (msg) => {
                  toast.success(msg);
                  this.studentForm.reset();
                  this.navCtrl.navigateBack('/home');
                  //this.router.navigate(['/home']);
                },
              });
            } else if (keys.includes('Status')) {
              let failedMessageObs = 'DEFAULTS.FAILED';
              let errorMessage = results[0].Status;
              this.appConfig.openAlertMessageBox(
                failedMessageObs,
                errorMessage
              );
            } else {
              throw Error('Unexpected response parsed.');
            }
            this.loadingService.dismiss();
          },
        });
    });
  }
  private setupFacultiesAutocompleteEventHandlers() {
    const filterFaculty = (facultyName: string) => {
      return this.faculties.filter((faculty) =>
        faculty.Facility_Name.toLocaleLowerCase().includes(
          facultyName.toLocaleLowerCase()
        )
      );
    };
    try {
      const searchFacultyControl = this.SDetails?.at(0)?.get(
        'SearchFacility'
      ) as FormControl;
      this.filteredFacultiesOptions$ = searchFacultyControl.valueChanges.pipe(
        startWith(''),
        map((value) => filterFaculty(value || ''))
      );
    } catch (error) {
      console.error(error);
    }
  }
  requestFacultiesList() {
    this.loadingService.startLoading().then((loading) => {
      this.apiService
        .GetFacilities({})
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res: any) => {
            this.faculties = res;
            this.setupFacultiesAutocompleteEventHandlers();
          },
          error: (err: any) => {
            let failedMessageObs = 'DEFAULTS.FAILED';
            let errorOccuredMessageObs =
              'ADD_STUDENT_PAGE.ERRORS.FAILED_TO_FIND_FACULTIES_TEXT';
            this.appConfig.openAlertMessageBox(
              failedMessageObs,
              errorOccuredMessageObs
            );
          },
        });
    });
  }
  validateForm(errors: { title: string; message: string }) {
    this.SDetails.controls.forEach((control, index) => {
      const search = control.get('SearchFacility');
      if (
        search?.hasError('invalidFacultyName') ||
        search?.hasError('required')
      ) {
        errors.message = search?.hasError('invalidFacultyName')
          ? 'REGISTER.REGISTER_FORM.ERRORS.SCHOOL_NAME_DOES_NOT_EXIST'
          : 'REGISTER.REGISTER_FORM.ERRORS.MISSING_SCHOOL';
      }
      const admissionNo = control.get('Admission_No');
      if (admissionNo?.hasError('required')) {
        errors.message = errors.message
          ? errors.message
          : 'REGISTER.REGISTER_FORM.ERRORS.MISSING_ADMISSION_NO';
      }
    });
  }
  //returns student details map only if form group is valid
  getStudentDetailsMap() {
    const details: Map<string, string>[] = [];
    for (const detail of this.SDetails.controls) {
      if (detail.invalid) {
        return new Map();
      }
      let facilityName = detail?.get('SearchFacility')?.value;
      let found = this.faculties.find(
        (e) =>
          e.Facility_Name.toLocaleLowerCase() ===
          facilityName.toLocaleLowerCase()
      );
      if (found) {
        let studentForm = new Map();
        studentForm.set('Facility_Reg_Sno', `${found.Facility_Reg_Sno}`);
        studentForm.set(
          'Admission_No',
          `${detail?.get('Admission_No')?.value}`
        );
        details.push(studentForm);
      } else {
        return new Map();
      }
    }
    return details;
  }
  submitForm() {
    const validateStudentDetailsForm = () => {
      let errors = { title: 'DEFAULTS.INVALID_FORM', message: '' };
      this.validateForm(errors);
      errors.message
        ? this.appConfig.openAlertMessageBox(errors.title, errors.message)
        : (() => {})();
    };
    const submission = () => {
      let studentDetails = this.getStudentDetailsMap();
      let addStudentForm = new Map();
      addStudentForm.set('User_Name', localStorage.getItem('User_Name')!);
      addStudentForm.set(
        'SDetails',
        (studentDetails as any[]).map((p) => Object.fromEntries(p))
      );
      this.requestAddStudent(Object.fromEntries(addStudentForm) as FParentReg);
    };

    if (this.studentForm.valid) {
      submission();
    } else {
      validateStudentDetailsForm();
      this.studentForm.markAllAsTouched();
    }
  }
  get SDetails() {
    return this.studentForm.get('SDetails') as FormArray;
  }
}
