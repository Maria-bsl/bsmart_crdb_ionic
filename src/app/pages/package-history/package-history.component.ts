import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatRadioModule } from '@angular/material/radio';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import {
  catchError,
  defaultIfEmpty,
  filter,
  finalize,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { IPackage } from 'src/app/models/forms/package.model';
import { GetSDetails } from 'src/app/models/responses/RGetSDetails';
import { RParentDetail } from 'src/app/models/responses/RParentDetails';
import {
  GetParentNamePipe,
  IsExpiredPackagePipe,
} from 'src/app/pipes/isExpiredPackage/is-expired-package.pipe';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { SubscriptionModuleNamesPipe } from '../../pipes/subscriptions-pipe/subscriptions.pipe';

@Component({
  selector: 'app-package-history',
  templateUrl: './package-history.component.html',
  styleUrls: ['./package-history.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    MatToolbarModule,
    MatMenuModule,
    MatMenuModule,
    MatIconModule,
    TranslateModule,
    CommonModule,
    MatRadioModule,
    GetParentNamePipe,
    IsExpiredPackagePipe,
    SubscriptionModuleNamesPipe,
  ],
})
export class PackageHistoryComponent implements OnInit {
  studentDetails$!: Observable<GetSDetails | RParentDetail | null>;
  packageHistoryList$!: Observable<IPackage[]>;
  constructor(
    private _appConfig: AppConfigService,
    private _unsubscribe: UnsubscribeService,
    private _loading: LoadingService,
    private _router: Router,
    private _location: Location,
    private _activatedRoute: ActivatedRoute,
    private _api: ApiService
  ) {
    this.init();
    this.registerIcons();
    this.requestStudentDetails();
    this.requestPackageHistory();
  }
  private init() {
    const backButton = () => {
      const backToLogin = () => this._location.back();
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
  }
  private registerIcons() {
    const icons = [
      'box-arrow-right',
      'trash',
      'gear',
      'chevron-left',
      'arrow-clockwise',
    ];
    this._appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
  private requestStudentDetails() {
    const data = localStorage.getItem('GetSDetails');
    const exists = () => data !== null && data !== undefined;
    const queryParams$ = this._activatedRoute.queryParams.pipe(
      filter((value) => Object.keys(value).includes('User_Name')),
      defaultIfEmpty(null),
      switchMap((value) =>
        value
          ? of(value)
          : throwError(
              () =>
                'LATEST_SUBSCRIPTIONS_PAGE.LABELS.ERROR_OCCURRED_ON_OUR_PAGE'
            )
      ),
      catchError((err) => {
        this._appConfig
          .openAlertMessageBox('DEFAULTS.FAILED', err)
          .subscribe({ next: () => this._router.navigate(['/login']) });
        throw err;
      }),
      filterNotNull(),
      map((value) => ({ User_Name: atob(value['User_Name']) })),
      switchMap((value) =>
        this._loading.open().pipe(
          switchMap((loading) =>
            this._api
              .getParentDetails(value)
              .pipe(finalize(() => loading.close()))
          ),
          catchError((err) => {
            this._appConfig
              .openAlertMessageBox(
                'DEFAULTS.FAILED',
                'LATEST_SUBSCRIPTIONS_PAGE.LABELS.ERROR_OCCURRED_ON_OUR_PAGE'
              )
              .subscribe({ next: () => this._router.navigate(['/login']) });
            throw err;
          })
        )
      ),
      shareReplay(1),
      map((value) => value[0])
    );
    const data$ = of(JSON.parse(data!) as GetSDetails).pipe(
      switchMap((value) =>
        this._loading.open().pipe(
          switchMap((loading) =>
            this._api
              .getParentDetails({
                User_Name: localStorage.getItem('User_Name')!,
              })
              .pipe(finalize(() => loading.close()))
          ),
          catchError((err) => {
            this._appConfig
              .openAlertMessageBox(
                'DEFAULTS.FAILED',
                'LATEST_SUBSCRIPTIONS_PAGE.LABELS.ERROR_OCCURRED_ON_OUR_PAGE'
              )
              .subscribe({ next: () => this._router.navigate(['/login']) });
            throw err;
          })
        )
      ),
      shareReplay(1),
      map((value) => value[0])
    );
    this.studentDetails$ = exists() ? data$ : queryParams$;
  }
  private requestPackageHistory() {
    this.packageHistoryList$ = this._activatedRoute.queryParams.pipe(
      filter((value) => Object.keys(value).includes('User_Name')),
      map((value) => ({ User_Name: atob(value['User_Name']) })),
      switchMap((value) => this._api.getPackageHistoryList(value)),
      shareReplay(1)
    );
  }
  ngOnInit() {}
  logoutClicked(event: any) {
    const dialogRef$ = this._appConfig.openConfirmMessageBox(
      'DEFAULTS.CONFIRM',
      'DEFAULTS.DIALOGS.SURE_LOGOUT_TEXT'
    );
    dialogRef$.subscribe({
      next: (dialogRef) => {
        dialogRef.componentInstance.confirmed
          .asObservable()
          .pipe(this._unsubscribe.takeUntilDestroy)
          .subscribe({
            next: () => {
              this._loading.startLoading().then((loading) => {
                localStorage.clear();
                setTimeout(() => {
                  this._loading.dismiss();
                  this._router.navigate(['/login']);
                }, 680);
              });
            },
          });
      },
      error: (e) => console.error(e),
    });
  }
}
