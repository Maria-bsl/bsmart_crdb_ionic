import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { IonContent, IonText, NavController } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, Observable, of } from 'rxjs';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { GetParentDetail } from 'src/app/models/responses/RGetParentDetails';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';

@Component({
  selector: 'app-get-support-form',
  templateUrl: './get-support-form.component.html',
  styleUrls: ['./get-support-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonText,
    HeaderSectionComponent,
    TranslateModule,
    CommonModule,
  ],
})
export class GetSupportFormComponent {
  selectedStudent$!: Observable<GetSDetailStudents>;
  parentDetail$!: Observable<GetParentDetail | null>;
  supportMobileNumber$: Observable<string[]> = of([
    '0684 831 846',
    '0741 831 847',
  ]);
  supportEmail$: Observable<string[]> = of([
    'info@bsmartacademia.com',
    'support@bizlogicsolutions.com',
  ]);
  constructor(
    private _appConfig: AppConfigService,
    private navCtrl: NavController,
    private loadingService: LoadingService,
    private apiService: ApiService,
    private _unsubscribe: UnsubscribeService
  ) {
    this.init();
  }
  private init() {
    const backButton = () => {
      const backToLogin = () =>
        this.navCtrl.navigateRoot('/tabs/tab-1/dashboard');
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    const createSelectedStudent = () => {
      this.selectedStudent$ = new Observable((subs) => {
        subs.next(JSON.parse(localStorage.getItem('selectedStudent')!));
        subs.complete();
      });
    };
    backButton();
    createSelectedStudent();
    this.selectedStudent$.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (selectedStudent) =>
        this.getParentDetails(selectedStudent.User_Name),
      error: (e) => console.error(e),
    });
  }
  private displayFailedToGetParentDetailsError() {
    let failedMessageObs = 'DEFAULTS.FAILED';
    let errorMessageObs =
      'CHANGE_PASSWORD_FORM.ERRORS.FAILED_TO_GET_PARENT_DETAILS';
    this._appConfig.openAlertMessageBox(failedMessageObs, errorMessageObs);
  }
  private getParentDetails(username: string) {
    const createParentDetail$ = (detail: GetParentDetail | null) => {
      this.parentDetail$ = new Observable((subs) => {
        subs.next(detail);
        subs.complete();
      });
    };
    this.loadingService.startLoading().then((loading) => {
      this.apiService
        .getParentDetails({ User_Name: username })
        .pipe(
          this._unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (res: any) => {
            if (Object.prototype.hasOwnProperty.call(res[0], 'Status')) {
              switch (res[0].Status) {
                case 'Parent Details':
                  createParentDetail$(res[0]);
                  break;
                case 'UserName not exists':
                default:
                  createParentDetail$(null);
                  break;
              }
            } else {
              this.displayFailedToGetParentDetailsError();
            }
          },
          error: (err) => {
            createParentDetail$(null);
            this.displayFailedToGetParentDetailsError();
          },
        });
    });
  }
}
