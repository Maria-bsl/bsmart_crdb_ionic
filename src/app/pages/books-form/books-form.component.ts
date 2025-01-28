import { Component, OnInit } from '@angular/core';
import { IonContent, IonText, NavController } from '@ionic/angular/standalone';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule, Location } from '@angular/common';
import { MatRippleModule } from '@angular/material/core';
import { finalize, Observable } from 'rxjs';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import { ISubject, ISubjectBook } from 'src/app/models/forms/isubjects';
import { ApiService } from 'src/app/services/api-service/api.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import {
  IsExistSubjectBooksPipe,
  IsNotNullSubjectBooksPipe,
} from 'src/app/pipes/books/books.pipe';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-books-form',
  templateUrl: './books-form.component.html',
  styleUrls: ['./books-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonText,
    MatExpansionModule,
    MatListModule,
    MatIconModule,
    HeaderSectionComponent,
    TranslateModule,
    CommonModule,
    MatRippleModule,
    IsExistSubjectBooksPipe,
    IsNotNullSubjectBooksPipe,
  ],
})
export class BooksFormComponent {
  selectedStudent$!: Observable<GetSDetailStudents>;
  subjects$!: Observable<ISubject[]>;
  subjectBooks$: (Observable<ISubjectBook[]> | null)[] = [];
  constructor(
    private apiService: ApiService,
    private loadingService: LoadingService,
    private _unsubscribe: UnsubscribeService,
    private navCtrl: NavController,
    private _appConfig: AppConfigService,
    private _location: Location
  ) {
    this.registerIcons();
    this.init();
    this.requestBooksList();
  }
  private registerIcons() {
    this._appConfig.addIcons(['book-fill'], '/assets/bootstrap-icons');
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
  }
  private requestBooksList() {
    this.selectedStudent$.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (selectedStudent) => {
        this.loadingService
          .startLoading()
          .then((loading) => {
            this.apiService
              .getBooksList({
                Facility_Reg_Sno: selectedStudent.Facility_Reg_Sno,
              })
              .pipe(
                this._unsubscribe.takeUntilDestroy,
                finalize(() => this.loadingService.dismiss())
              )
              .subscribe({
                next: (res) => {
                  this.subjectBooks$ = Array.from(
                    { length: res.length },
                    () => null
                  );
                  this.subjects$ = new Observable((subscriber) => {
                    subscriber.next(res);
                    subscriber.complete();
                  });
                },
                error: (err) => console.error('Failed to get books list', err),
              });
          })
          .catch((err) => console.error('Failed to open loading', err));
      },
      error: (e) => console.error(e),
    });
  }
  requestSubjectBooks(subjectSno: number, index: number) {
    if (this.subjectBooks$.at(index)) return;
    this.selectedStudent$.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (selectedStudent) => {
        this.apiService
          .getBookDetailsList({
            Facility_Reg_Sno: selectedStudent.Facility_Reg_Sno,
            Subject_Sno: subjectSno,
          })
          .pipe(this._unsubscribe.takeUntilDestroy)
          .subscribe({
            next: (res) => {
              try {
                if (index < 0 || index >= this.subjectBooks$.length)
                  throw Error('Index out of bounds');
                const obs = new Observable<ISubjectBook[]>((subscriber) => {
                  subscriber.next(res);
                  subscriber.complete();
                });
                this.subjectBooks$[index] = obs;
              } catch (err) {
                console.error(err);
              }
            },
            error: (err) => console.error('Failed to fetch book details', err),
          });
      },
      error: (e) => console.error(e),
    });
  }
}
