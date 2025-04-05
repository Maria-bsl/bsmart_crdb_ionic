import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRipple, MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatListModule } from '@angular/material/list';
import { MatRadioModule } from '@angular/material/radio';
import {
  ActivatedRoute,
  NavigationExtras,
  Router,
  RouterLink,
} from '@angular/router';
import {
  IonContent,
  IonTitle,
  IonBackButton,
  IonButtons,
  IonHeader,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  catchError,
  concatMap,
  defaultIfEmpty,
  defer,
  filter,
  finalize,
  firstValueFrom,
  from,
  iif,
  last,
  map,
  mergeMap,
  Observable,
  of,
  share,
  shareReplay,
  switchMap,
  take,
  tap,
  throwError,
  zip,
} from 'rxjs';
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
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { MatChipsModule } from '@angular/material/chips';
import { FLoginForm } from 'src/app/models/forms/login.model';
import { load } from 'google-maps';
import { RParentDetail } from 'src/app/models/responses/RParentDetails';
import {
  GetParentNamePipe,
  IsExpiredPackagePipe,
} from 'src/app/pipes/isExpiredPackage/is-expired-package.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { SubscriptionModuleNamesPipe } from 'src/app/pipes/subscriptions-pipe/subscriptions.pipe';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SharedService } from 'src/app/services/shared-service/shared.service';

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
    MatMenuModule,
    MatCheckboxModule,
    MatListModule,
    MatRippleModule,
    MatRadioModule,
    SubscriptionModuleNamesPipe,
    FindPackagePipe,
    SwitchPackageNamePipe,
    SwitchPackageNameForColorPipe,
    MatRippleModule,
    IonBackButton,
    IonButtons,
    HeaderSectionComponent,
    MatChipsModule,
    IonHeader,
    IsExpiredPackagePipe,
    GetParentNamePipe,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class LatestSubscriptionsPageComponent {
  studentDetails$!: Observable<GetSDetails | RParentDetail | null>;
  package$!: Observable<IPackage[]>;
  packageList$!: Observable<
    { Package_Mas_Sno: number; Package_Name: string }[]
  >;
  packagePrices$!: Observable<IPackage[]>;
  formGroup!: FormGroup;
  constructor(
    private appConfig: AppConfigService,
    private apiService: ApiService,
    private _loading: LoadingService,
    private unsubscribe: UnsubscribeService,
    private router: Router,
    private _tr: TranslateService,
    private activatedRoute: ActivatedRoute,
    private _fb: FormBuilder,
    private _shared: SharedService
  ) {
    this.registerIcons();
    this.createFormGroup();
    this.createStudentDetails();
    this.appConfig.addIcons(
      ['chevron-left', 'chevron-right', 'box-arrow-right'],
      '/assets/bootstrap-icons'
    );
    this.init();
    this.requestStudentPackage();
    this.onSuccessTransaction();
  }
  private createFormGroup() {
    this.formGroup = this._fb.group({
      activePackage: this._fb.control('', [Validators.required]),
    });
  }
  private registerIcons() {
    const icons = [
      'box-arrow-right',
      'trash',
      'gear',
      'chevron-left',
      'arrow-clockwise',
    ];
    this.appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
  private onSuccessTransaction() {
    this.activatedRoute.queryParams
      .pipe(
        filter(
          (value) =>
            Object.keys(value).includes('User_Name') &&
            Object.keys(value).includes('Password')
        ),
        map((value) => ({
          User_Name: atob(value['User_Name']),
          Password: atob(value['Password']),
        })),
        switchMap((value) =>
          this.apiService.signIn(value).pipe(
            filterNotNull(),
            map((values) => values[0] as GetSDetails)
          )
        )
      )
      .subscribe({
        next(res) {
          const GetSDetails = JSON.stringify(res);
          localStorage.setItem('GetSDetails', GetSDetails);
        },
      });
  }
  private createStudentDetails() {
    const data = localStorage.getItem('GetSDetails');
    const exists = () => data !== null && data !== undefined;
    const queryParams$ = this.activatedRoute.queryParams.pipe(
      filter(
        (value) =>
          Object.keys(value).includes('User_Name') &&
          Object.keys(value).includes('Password')
      ),
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
        this.appConfig
          .openAlertMessageBox('DEFAULTS.FAILED', err)
          .subscribe({ next: () => this.router.navigate(['/login']) });
        throw err;
      }),
      filterNotNull(),
      map((value) => {
        return { User_Name: atob((value as FLoginForm).User_Name) };
      }),
      switchMap((value) =>
        this._loading.open().pipe(
          switchMap((loading) =>
            this.apiService
              .getParentDetails(value)
              .pipe(finalize(() => loading.close()))
          ),
          catchError((err) => {
            this.appConfig
              .openAlertMessageBox(
                'DEFAULTS.FAILED',
                'LATEST_SUBSCRIPTIONS_PAGE.LABELS.ERROR_OCCURRED_ON_OUR_PAGE'
              )
              .subscribe({ next: () => this.router.navigate(['/login']) });
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
            this.apiService
              .getParentDetails({
                User_Name: localStorage.getItem('User_Name')!,
              })
              .pipe(finalize(() => loading.close()))
          ),
          catchError((err) => {
            this.appConfig
              .openAlertMessageBox(
                'DEFAULTS.FAILED',
                'LATEST_SUBSCRIPTIONS_PAGE.LABELS.ERROR_OCCURRED_ON_OUR_PAGE'
              )
              .subscribe({ next: () => this.router.navigate(['/login']) });
            throw err;
          })
        )
      ),
      shareReplay(1),
      map((value) => value[0])
    );
    this.studentDetails$ = exists() ? data$ : queryParams$;
  }
  private init() {
    const backButton = () => {
      const backToLogin = () => this.router.navigate(['/home']);
      this.appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
  }
  private requestStudentPackage() {
    this.packagePrices$ = this._loading
      .open()
      .pipe(
        mergeMap((loading) =>
          this.apiService
            .getPackagePriceList({})
            .pipe(finalize(() => loading && loading.close()))
        )
      );
    this.packageList$ = this.apiService.getPackageList({});
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
  logoutClicked(event: any) {
    const dialogRef$ = this.appConfig.openConfirmMessageBox(
      'DEFAULTS.CONFIRM',
      'DEFAULTS.DIALOGS.SURE_LOGOUT_TEXT'
    );
    dialogRef$.subscribe({
      next: (dialogRef) => {
        dialogRef.componentInstance.confirmed
          .asObservable()
          .pipe(this.unsubscribe.takeUntilDestroy)
          .subscribe({
            next: () => {
              this._loading.startLoading().then((loading) => {
                localStorage.clear();
                setTimeout(() => {
                  this._loading.dismiss();
                  this.router.navigate(['/login']);
                }, 680);
              });
            },
          });
      },
      error: (e) => console.error(e),
    });
  }
  packageClicked(packageName: string) {
    const package$ = this.packageList$.pipe(
      mergeMap((items) =>
        from(items).pipe(
          filter((item) => item.Package_Name === packageName),
          map((item) => item)
        )
      )
    );
    this.activatedRoute.queryParams
      .pipe(
        filter(
          (value) =>
            Object.keys(value).includes('User_Name') &&
            Object.keys(value).includes('Password')
        ),
        map((value) => ({ User_Name: atob(value['User_Name']) })),
        switchMap((userNameObj) =>
          package$.pipe(
            switchMap((value) =>
              defer(() =>
                this.router.navigate(['/package/subscribe'], {
                  queryParams: {
                    'show-back-button': true,
                    'page-title': this._tr.instant(
                      'SUBSCRIPTION_PAGE.LABELS.MAKE_PAYMENT'
                    ),
                    'is-pending-fee': true,
                    package: JSON.stringify(value),
                    User_Name: userNameObj.User_Name,
                  },
                })
              )
            )
          )
        )
      )
      .subscribe({
        error: (err) => console.error(err),
      });
    this.activatedRoute.queryParams
      .pipe(
        filter(
          (value) =>
            !(
              Object.keys(value).includes('User_Name') &&
              Object.keys(value).includes('Password')
            )
        ),
        switchMap((params) =>
          package$.pipe(
            switchMap((value) =>
              defer(() =>
                this.router.navigate(['/package/subscribe'], {
                  queryParams: {
                    'show-back-button': true,
                    'page-title': this._tr.instant(
                      'SUBSCRIPTION_PAGE.LABELS.MAKE_PAYMENT'
                    ),
                    'is-pending-fee': true,
                    package: JSON.stringify(value),
                    User_Name: btoa(
                      params['User_Name'] ?? localStorage.getItem('User_Name')!
                    ),
                  },
                })
              )
            )
          )
        )
      )
      .subscribe({
        error: (err) => console.error(err),
      });
  }
  navigateToHistory(event: MouseEvent) {
    this.activatedRoute.queryParams
      .pipe(
        switchMap((params) =>
          defer(() =>
            this.router.navigate(['/package/history'], {
              queryParams: {
                'show-back-button': true,
                'page-title': this._tr.instant(
                  'SUBSCRIPTION_PAGE.LABELS.PACKAGE_HISTORY'
                ),
                'is-pending-fee': true,
                User_Name: btoa(
                  params['User_Name'] ?? localStorage.getItem('User_Name')!
                ),
              },
            })
          )
        )
      )
      .subscribe({
        error: (err) => console.error(err),
      });
  }
  goBack(event: MouseEvent) {
    this.appConfig.goBack();
  }
  get activePackage() {
    return this.formGroup.get('activePackage') as FormControl;
  }
  get isLoggedInPackage() {
    return !!localStorage.getItem('User_Name');
  }
}
