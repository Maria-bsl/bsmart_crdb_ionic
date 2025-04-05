import { CommonModule, Location } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import {
  IonContent,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonText,
  NavController,
  IonModal,
  IonHeader,
  IonItem,
  IonToolbar,
  IonButton,
  IonInput,
  ModalController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  bufferCount,
  concatMap,
  debounceTime,
  defer,
  filter,
  finalize,
  firstValueFrom,
  from,
  lastValueFrom,
  map,
  mergeMap,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap,
  toArray,
  withLatestFrom,
  zip,
} from 'rxjs';
import { PayWithMpesaComponent } from 'src/app/components/dialogs/pay-with-mpesa/pay-with-mpesa.component';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { IPackage } from 'src/app/models/forms/package.model';
import {
  FindPackagePipe,
  SwitchPackageNamePipe,
} from 'src/app/pipes/is-empty-shelf/is-empty-shelf.pipe';
import { SubscriptionModuleNamesPipe } from 'src/app/pipes/subscriptions-pipe/subscriptions.pipe';
import { ApiService } from 'src/app/services/api-service/api.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { SharedService } from 'src/app/services/shared-service/shared.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import Swal from 'sweetalert2';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

export interface IPackageRenew {
  Package_ControlNumber: string;
  Package_Amount: number;
  Package_Mas_Sno: number;
}

@Component({
  selector: 'app-subscription-page',
  templateUrl: './subscription-page.component.html',
  styleUrls: ['./subscription-page.component.scss'],
  standalone: true,
  providers: [AndroidPermissions],
  imports: [
    IonInput,
    IonButton,
    IonContent,
    IonButtons,
    IonBackButton,
    IonText,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    TranslateModule,
    MatCardModule,
    FindPackagePipe,
    CommonModule,
    IonTitle,
    SwitchPackageNamePipe,
    MatTabsModule,
    MatButtonModule,
    MatRippleModule,
    MatFormFieldModule,
    MatInputModule,
    HeaderSectionComponent,
    MatChipsModule,
    SubscriptionModuleNamesPipe,
    IonModal,
    IonHeader,
    IonToolbar,
    IonItem,
    ReactiveFormsModule,
  ],
})
export class SubscriptionPageComponent {
  packagePrices$!: Observable<IPackage[]>;
  packageRenew$!: Observable<IPackageRenew>;
  formGroup!: FormGroup;
  loading = signal<boolean>(false);
  constructor(
    private tr: TranslateService,
    private appConfig: AppConfigService,
    private _dialog: MatDialog,
    private unsubscribe: UnsubscribeService,
    private modalCtrl: ModalController,
    private location: Location,
    private _loading: LoadingService,
    private router: Router,
    private _api: ApiService,
    private activatedRoute: ActivatedRoute,
    private _shared: SharedService,
    private _fb: FormBuilder,
    private androidPermissions: AndroidPermissions
  ) {
    this.createFormGroup();
    this.registerIcons();
    this.requestStudentPackage();
    const backButton = () => {
      const backToLogin = () =>
        new Promise((resolve, reject) => resolve(this.location.back()));
      this.appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
    this.appConfig.addIcons(
      ['chevron-left', 'chevron-right', 'box-arrow-right'],
      '/assets/bootstrap-icons'
    );
    this.appConfig.addIcons(['mpesa-vodacom'], '/assets/components');
  }
  private createFormGroup() {
    this.formGroup = this._fb.group({
      pin: this._fb.control('', [Validators.required]),
    });
    this.pin.valueChanges
      .pipe(
        filter((value) => value.length >= 4),
        debounceTime(0),
        mergeMap((value) =>
          this.package$.pipe(
            map((res) => res.Package_Amount),
            mergeMap((amount) =>
              this.packageRenew$.pipe(
                map((res) => [
                  '*150*00#',
                  res.Package_ControlNumber,
                  `${amount}`,
                  value,
                  '1',
                ])
              )
            )
          )
        )
        //tap(() => this.loading.set(true))
      )
      .subscribe({
        next: (value) => {
          const checked$ = of(
            this.androidPermissions.PERMISSION.CALL_PHONE,
            this.androidPermissions.PERMISSION.RECEIVE_SMS
          );
          checked$
            .pipe(
              concatMap((permission?) =>
                defer(() =>
                  this.androidPermissions.checkPermission(permission)
                ).pipe(map((res) => res.hasPermission))
              ),
              bufferCount(2)
            )
            .subscribe({
              next: (permissions) => {
                //this.loading.set(true);
                !permissions.every((res) => res) &&
                  value.push('MISSING PERMISSION');
                this.makePayment(value.join(','));
              },
            });
        },
        error: (err) => console.error(err),
        complete: () => console.log('done'),
      });
  }
  private makePayment(payment: string) {
    this.loading.set(true);
    const win = window as any;
    const message = (msg: string) =>
      this.appConfig.openAlertMessageBox('DEFAULTS.FAILED', msg);
    const stopReceiver = () => {
      this.loading.set(false);
      win.sms.stopReceiving(
        function () {
          alert('has stopped receiver Correctly');
        },
        function () {
          alert('Error while stopping the SMS receiver');
        }
      );
    };
    const startReceiver = () => {
      const transactionStatus = (
        state: 'error' | 'success',
        message: string
      ) => {
        const dialog = this.appConfig.openStatePanel(
          state,
          this.tr.instant(message)
        );
        dialog.afterOpened().subscribe({
          next: () => this.loading.set(false),
        });
        dialog.afterClosed().subscribe({
          next: () => {
            this.router.navigate(['/home'], { replaceUrl: true });
          },
        });
      };
      win.sms.startReceiving(
        function (msg: string) {
          const toLower = msg.toLowerCase();
          const targetStrings = ['imethibitishwa', 'confirmed'];
          if (targetStrings.some((str) => !toLower.includes(str))) {
            transactionStatus(
              'error',
              'SUBSCRIPTION_PAGE.LABELS.TRANSACTION_FAILED'
            );
          } else {
            transactionStatus(
              'success',
              'SUBSCRIPTION_PAGE.LABELS.PAYMENT_SUCCESSFUL'
            );
          }
          stopReceiver();
        },
        function () {
          message('SUBSCRIPTION_PAGE.LABELS.TRANSACTION_FAILED');
          stopReceiver();
        }
      );
    };
    const paymentProcess = () => {
      startReceiver();
      win.plugins.voIpUSSD.show(
        payment,
        function (data: any) {
          console.log('USSD Success: ' + data);
        },
        function (err: any) {
          console.log('USSD Erreur: ' + err);
        }
      );
    };
    win.sms.isSupported(
      (supported: any) => {
        if (supported) {
          paymentProcess();
        } else {
          message('SUBSCRIPTION_PAGE.LABELS.TRANSACTION_FAILED');
        }
      },
      () => {
        message('SUBSCRIPTION_PAGE.LABELS.TRANSACTION_FAILED');
      }
    );
    this.createFormGroup();
    this.modalCtrl.dismiss();
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
  private requestStudentPackage() {
    this.packagePrices$ = this._loading.open().pipe(
      mergeMap((loading) =>
        this._api
          .getPackagePriceList({})
          .pipe(finalize(() => loading && loading.close()))
      ),
      shareReplay(1) // ✅ Ensures that all subscribers get the last emitted value
    );
    this.packageRenew$ = this.activatedRoute.queryParams.pipe(
      map((params) => ({
        package: JSON.parse(params['package']) as IPackage,
        User_Name:
          atob(params['User_Name']) ?? atob(localStorage.getItem('User_Name')!),
      })),
      mergeMap((res) =>
        this._api
          .packageRenew({
            User_Name: res.User_Name,
            Package_Mas_Sno: res.package.Package_Mas_Sno,
          })
          .pipe(
            map((res) => res[0])
            // filter(
            //   (res) => res.Package_Amount !== 0 && res.Package_Mas_Sno !== 0
            // )
          )
      )
    );
  }
  private payWithMpesa(bag: IPackage) {
    const dialog = this._dialog.open(PayWithMpesaComponent, {
      width: '400px',
      data: {
        package: bag,
        amount: bag.Package_Amount,
        description: `${bag.Package_Name} package subscription`,
      },
      panelClass: 'm-pesa-panel',
      disableClose: true,
    });
    this._shared.transactionSuccess
      .asObservable()
      .pipe(
        switchMap(() =>
          this.activatedRoute.queryParams.pipe(
            map((params) => ({
              package: JSON.parse(params['package']) as IPackage,
              User_Name:
                params['User_Name'] ?? localStorage.getItem('User_Name'),
            })),
            switchMap((value) =>
              this._loading.open().pipe(
                switchMap((loading) =>
                  this._api
                    .packageRenew({
                      User_Name: value.User_Name,
                      Package_Mas_Sno: value.package.Package_Mas_Sno,
                    })
                    .pipe(
                      map((res) => res[0]),
                      tap((res) =>
                        this.appConfig.openAlertMessageBox(
                          this.tr.instant(
                            'SUBSCRIPTION_PAGE.LABELS.CONTROL_NUMBER'
                          ),
                          this.tr
                            .instant(
                              'SUBSCRIPTION_PAGE.LABELS.PAYMENT_MADE_TO_CONTROL_NUMBER'
                            )
                            .replace('{{}}', res.Package_ControlNumber)
                        )
                      ),
                      switchMap(() =>
                        defer(() =>
                          this.router.navigate(['/home'], { replaceUrl: true })
                        )
                      ),
                      finalize(() => loading && loading.close())
                    )
                )
              )
            )
          )
        )
      )
      .subscribe({
        next: (value) => value && dialog.close(),
      });
  }
  openPayWithMpesa() {
    this.package$.subscribe({
      next: (value) => {
        this.payWithMpesa(value);
      },
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
  goBack(event: MouseEvent) {
    this.appConfig.goBack();
  }
  get package$() {
    return this.activatedRoute.queryParams.pipe(
      filterNotNull(),
      map((params) => JSON.parse(params['package']) as IPackage),
      switchMap(
        (value) =>
          this.packagePrices$
            ? this.packagePrices$.pipe(
                map((packages) =>
                  packages.filter((p) => p.Package_Name === value.Package_Name)
                )
              )
            : of([]) // ✅ Ensures packagePrices$ is never undefined
      ),
      map((values) => values[0])
    );
  }
  get pin() {
    return this.formGroup.get('pin') as FormControl;
  }
}
