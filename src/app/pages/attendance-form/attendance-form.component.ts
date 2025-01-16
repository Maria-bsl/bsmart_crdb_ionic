import { CommonModule, DatePipe } from '@angular/common';
import { Component, model, OnInit } from '@angular/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import moment from 'moment';
import { map } from 'rxjs';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { AttendancePageService } from 'src/app/services/attendance-page-service/attendance-page-service.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';

@Component({
  selector: 'app-attendance-form',
  templateUrl: './attendance-form.component.html',
  styleUrls: ['./attendance-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    HeaderSectionComponent,
    TranslateModule,
    MatIconModule,
    MatDatepickerModule,
    CommonModule,
  ],
  providers: [DatePipe],
})
export class AttendanceFormComponent {
  attendanceScore$ = this.attendanceService.attendanceScore$
    .asObservable()
    .pipe(
      map((scores) =>
        scores.map((s) => {
          return {
            ...s,
            StartDate: (() => {
              let p = this.months.find(
                (m) =>
                  m.month?.toLocaleLowerCase() === s.Month.toLocaleLowerCase()
              );
              if (p) {
                //return new Date(Number(s.Year), p.index, 1);
                return this.getMonthStartAndEndDates(Number(s.Year), p.index)
                  .startDate;
              }
              return null;
            })(),
            EndDate: (() => {
              let p = this.months.find(
                (m) =>
                  m.month?.toLocaleLowerCase() === s.Month.toLocaleLowerCase()
              );
              if (p) {
                return this.getMonthStartAndEndDates(Number(s.Year), p.index)
                  .endDate;
              }
              return null;
            })(),
          };
        })
      )
    );
  selected = model<Date | null>(new Date());
  months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    .map((x) => new Date(new Date().getFullYear(), x, 1))
    .map((m, index) => {
      return {
        month: this.datePipe.transform(m, 'MMMM'),
        index: index,
      };
    });
  currentIndex: number = 0;
  constructor(
    private attendanceService: AttendancePageService,
    private _appConfig: AppConfigService,
    private navCtrl: NavController,
    private datePipe: DatePipe,
    private _unsubscribe: UnsubscribeService
  ) {
    this.init();
    this.registerIcons();
    this.attendanceService.requestAttendanceScore();
  }
  private init() {
    const backButton = () => {
      const backToLogin = () => this.navCtrl.navigateRoot('/home');
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
  }
  private registerIcons() {
    const icons = ['chevron-left', 'chevron-right'];
    this._appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
  private getMonthStartAndEndDates(
    year: number,
    month: number
  ): { startDate: Date; endDate: Date } {
    if (month < 0 || month > 11) {
      throw new Error(
        'Invalid month. Month should be a value between 1 and 12.'
      );
    }
    const startDate = moment([year, month]).toDate();
    const endDate = moment(startDate).endOf('month').toDate();

    return { startDate, endDate };
  }
  scrollToItem(event: Event, itemId: string): void {
    event.preventDefault();
    const element = document.getElementById(itemId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
  nextScore(event: Event) {
    const scrollToItem = (scores: any[]) => {
      if (this.currentIndex < scores.length - 1) {
        this.currentIndex++;
        this.scrollToItem(event, `slide-${this.currentIndex}`);
      }
    };
    this.attendanceScore$.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (scores) => scrollToItem(scores),
      error: (err) => console.error,
    });
  }
  prevScore(event: Event) {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.scrollToItem(event, `slide-${this.currentIndex}`);
    }
  }
}
