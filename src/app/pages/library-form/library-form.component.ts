import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { IonContent, IonText, NavController } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { Observable, of, zip, finalize } from 'rxjs';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { FBookForm } from 'src/app/models/forms/f-time-table-form';
import { BookBorrowed, BookReturned } from 'src/app/models/forms/library-book';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import { IsEmptyShelfPipe } from 'src/app/pipes/is-empty-shelf/is-empty-shelf.pipe';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';

@Component({
  selector: 'app-library-form',
  templateUrl: './library-form.component.html',
  styleUrls: ['./library-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonText,
    HeaderSectionComponent,
    MatTabsModule,
    MatCardModule,
    MatIconModule,
    CommonModule,
    TranslateModule,
    IsEmptyShelfPipe,
  ],
})
export class LibraryFormComponent {
  selectedStudent$!: Observable<GetSDetailStudents>;
  booksReturned$: Observable<BookReturned[] | { Status: string }[] | any> = of(
    []
  );
  booksBorrowed$: Observable<BookBorrowed[] | { Status: string }[] | any> = of(
    []
  );
  constructor(
    private apiService: ApiService,
    private _appConfig: AppConfigService,
    private _unsubscribe: UnsubscribeService,
    private loadingService: LoadingService,
    private navCtrl: NavController
  ) {
    this.init();
    this.registerIcons();
    this.initPage();
  }
  private init() {
    const backButton = () => {
      const backToLogin = () => this.navCtrl.navigateRoot('/home');
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
  private registerIcons() {
    this._appConfig.addIcons(['book-fill'], '/assets/bootstrap-icons');
  }
  private initPage() {
    const selected = (selectedStudent: GetSDetailStudents) => {
      let body: FBookForm = {
        Facility_Reg_Sno: selectedStudent.Facility_Reg_Sno,
        Admission_No: selectedStudent.Admission_No,
        Academic_Sno: selectedStudent.Academic_Sno,
      };
      this.loadingService.startLoading().then((loading) => {
        const booksReturned = this.apiService.getBooksReturned(body);
        const booksBorrowed = this.apiService.getBooksBorrowed(body);
        const merged = zip(booksReturned, booksBorrowed);
        merged
          .pipe(
            this._unsubscribe.takeUntilDestroy,
            finalize(() => this.loadingService.dismiss())
          )
          .subscribe({
            next: (results) => {
              let [returned, borrowed] = results;
              this.booksReturned$ = of(returned);
              this.booksBorrowed$ = of(borrowed);
            },
          });
      });
    };
    this.selectedStudent$.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (selectedStudent) => selected(selectedStudent),
      error: (e) => console.error(e),
    });
  }
}
