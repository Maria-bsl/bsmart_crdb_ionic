import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRipple, MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationExtras, Router } from '@angular/router';
import {
  IonContent,
  IonTitle,
  IonBackButton,
  IonButtons,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { finalize, firstValueFrom, Observable, of, zip } from 'rxjs';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { IPackage } from 'src/app/models/forms/package.model';
import { GetSDetails } from 'src/app/models/responses/RGetSDetails';
import {
  FindPackagePipe,
  SwitchPackageNameForColorPipe,
  SwitchPackageNamePipe,
} from 'src/app/pipes/is-empty-shelf/is-empty-shelf.pipe';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { MatChipsModule } from '@angular/material/chips';

@Component({
  selector: 'app-latest-subscriptions-page',
  templateUrl: './latest-subscriptions-page.component.html',
  styleUrls: ['./latest-subscriptions-page.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonTitle,
    IonContent,
    TranslateModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatCardModule,
    FindPackagePipe,
    SwitchPackageNamePipe,
    SwitchPackageNameForColorPipe,
    MatRippleModule,
    IonBackButton,
    IonButtons,
    HeaderSectionComponent,
    MatChipsModule,
  ],
})
export class LatestSubscriptionsPageComponent {
  studentDetails: GetSDetails = JSON.parse(
    localStorage.getItem('GetSDetails')!
  );
  package$!: Observable<IPackage[]>;
  packageHistory$!: Observable<IPackage[]>;
  constructor(
    private appConfig: AppConfigService,
    private apiService: ApiService,
    private loadingService: LoadingService,
    private unsubscribe: UnsubscribeService,
    private router: Router,
    private _tr: TranslateService
  ) {
    this.appConfig.addIcons(
      ['chevron-left', 'chevron-right', 'box-arrow-right'],
      '/assets/bootstrap-icons'
    );
    this.init();
    this.requestStudentPackage();
  }
  private init() {
    const backButton = () => {
      const backToLogin = () => this.router.navigate(['/home']);
      this.appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
  }
  private requestStudentPackage() {
    let priceListReq = this.apiService.getPackagePriceList({});
    let historyListReq = this.apiService.getPackageHistoryList({
      User_Name: this.studentDetails.Students![0].User_Name,
    });
    let merged = zip(priceListReq, historyListReq);
    this.loadingService.startLoading().then((loading) => {
      merged
        .pipe(
          this.unsubscribe.takeUntilDestroy,
          finalize(() => this.loadingService.dismiss())
        )
        .subscribe({
          next: (results) => {
            let [priceList, historyList] = results;
            this.package$ = of(priceList);
            this.packageHistory$ = of(historyList);
          },
          complete: () => this.loadingService.dismiss(),
        });
    });
  }
  openSubscriptionPage(event: any, packageSno: number) {
    const merged = zip(
      this._tr.get('DASHBOARD_PAGE.LABELS.SCHOOL_FEES'),
      this.package$
    );
    merged.pipe(this.unsubscribe.takeUntilDestroy).subscribe({
      next: (results) => {
        const [label, packages] = results;
        this.router.navigate(['/package/subscribe'], {
          queryParams: {
            'show-back-button': true,
            'page-title': label,
            'is-pending-fee': true,
          },
          state: {
            package: packages.find((p) => p.Package_Mas_Sno === packageSno),
          },
        });
      },
      error: (e) => console.error(e),
    });
  }
}
