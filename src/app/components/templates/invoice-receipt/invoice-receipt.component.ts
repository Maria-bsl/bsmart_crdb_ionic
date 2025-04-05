import { CommonModule, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Inject,
  Input,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  bufferCount,
  concatMap,
  debounceTime,
  defer,
  distinctUntilChanged,
  filter,
  fromEvent,
  map,
  mapTo,
  merge,
  mergeMap,
  of,
  switchMap,
  tap,
  zip,
} from 'rxjs';
//import { GetSDetailStudents } from 'src/app/core/interfaces/GetSDetails';
// import {
//   StudentInvoice,
//   StudentPaidInvoice,
//   StudentPendingInvoice,
// } from 'src/app/core/types/student-invoices';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { JspdfUtilsService } from 'src/app/services/jsdpdf-utils/jspdf-utils.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { PayWithMpesaComponent } from '../../dialogs/pay-with-mpesa/pay-with-mpesa.component';
import { MatDialog } from '@angular/material/dialog';
import {
  IonText,
  IonModal,
  IonContent,
  ModalController,
} from '@ionic/angular/standalone';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  FileOpener,
  FileOpenerOptions,
} from '@capacitor-community/file-opener';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import {
  StudentInvoice,
  StudentPaidInvoice,
  StudentPendingInvoice,
} from 'src/app/models/forms/invoices.model';
import { SharedService } from 'src/app/services/shared-service/shared.service';
import { Router } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';

@Component({
  selector: 'app-invoice-receipt',
  templateUrl: './invoice-receipt.component.html',
  styleUrls: ['./invoice-receipt.component.scss'],
  standalone: true,
  providers: [AndroidPermissions],
  imports: [
    IonContent,
    TranslateModule,
    MatCardModule,
    MatDividerModule,
    CommonModule,
    MatIconModule,
    MatButtonModule,
    IonText,
    IonModal,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
  ],
})
export class InvoiceReceiptComponent implements OnInit, AfterViewInit {
  formGroup!: FormGroup;
  selectedStudent: GetSDetailStudents = JSON.parse(
    localStorage.getItem('selectedStudent')!
  );
  @Input() invoice!:
    | StudentInvoice
    | StudentPendingInvoice
    | StudentPaidInvoice
    | any;
  @Input() canDownload: boolean = true;
  @Input() identifier: string = '';
  @ViewChild('invoiceReceipt') invoiceReceipt!: ElementRef<HTMLDivElement>;
  @ViewChild('actions') actions!: ElementRef<HTMLElement>;
  isDownloading = signal<boolean>(false);
  loading = signal<boolean>(false);
  constructor(
    private loadingService: LoadingService,
    private jsPdfService: JspdfUtilsService,
    private appConfig: AppConfigService,
    private _dialog: MatDialog,
    private _unsubscribe: UnsubscribeService,
    private tr: TranslateService,
    private _shared: SharedService,
    private _router: Router,
    private modalCtrl: ModalController,
    private _fb: FormBuilder,
    private androidPermissions: AndroidPermissions
  ) {
    this.createFormGroup();
    const icons = ['arrow-right', 'download'];
    this.appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
  private createFormGroup() {
    this.formGroup = this._fb.group({
      pin: this._fb.control('', [Validators.required]),
    });
    this.pinChangedListener();
  }
  private pinChangedListener() {
    this.pin.valueChanges
      .pipe(
        filter((value) => value.length >= 4),
        map((value) => [
          '*150*00#',
          `${this.invoice.Invoice_No}`,
          `${this.invoice.Pending_Amount}`,
          value,
          '1',
        ]),
        concatMap((values: string[]) =>
          of(
            this.androidPermissions.PERMISSION.CALL_PHONE,
            this.androidPermissions.PERMISSION.RECEIVE_SMS
          ).pipe(
            concatMap((permission?) =>
              defer(() =>
                this.androidPermissions.checkPermission(permission)
              ).pipe(map((res) => res.hasPermission))
            ),
            bufferCount(2),
            map((permissions) =>
              permissions.every((res) => res)
                ? values
                : [...values, 'MISSING PERMISSION']
            ),
            map((values) => values.join(','))
          )
        )
      )
      .subscribe({
        next: (value) => this.makePayment(value),
      });
  }
  private transactionStatusDialog(state: 'error' | 'success', message: string) {
    const dialog = this.appConfig.openStatePanel(
      state,
      this.tr.instant(message)
    );
    dialog.afterOpened().subscribe({
      next: () => this.loading.set(false),
    });
    dialog.afterClosed().subscribe({
      next: () => {
        this._router.navigate(['/tabs/tab-1/dashboard'], {
          replaceUrl: true,
        });
      },
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
        () => {},
        () => {}
      );
    };
    const startReceiver = () => {
      win.sms.startReceiving(
        (msg: string) => {
          const toLower = msg.toLowerCase();
          const targetStrings = ['imethibitishwa', 'confirmed'];
          if (targetStrings.some((str) => !toLower.includes(str))) {
            this.transactionStatusDialog(
              'error',
              'SUBSCRIPTION_PAGE.LABELS.TRANSACTION_FAILED'
            );
            stopReceiver();
          } else {
            this.transactionStatusDialog(
              'success',
              'SUBSCRIPTION_PAGE.LABELS.PAYMENT_SUCCESSFUL'
            );
            stopReceiver();
          }
        },
        () => {
          message('SUBSCRIPTION_PAGE.LABELS.TRANSACTION_FAILED');
          stopReceiver();
        }
      );
    };
    const paymentProcess = () => {
      win.plugins.voIpUSSD.show(
        payment,
        (data: any) => {
          console.log('USSD Success: ' + data);
        },
        (err: any) => {
          console.log('USSD Erreur: ' + err);
        }
      );
    };
    win.sms.isSupported(
      (supported: any) => {
        if (supported) {
          startReceiver();
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
  ngOnInit() {}
  ngAfterViewInit(): void {}
  downloadInvoiceFee(event: MouseEvent) {
    this.loadingService.startLoading().then((loading) => {
      this.isDownloading.set(true);
      setTimeout(() => {
        let filename = `invoice_receipt.pdf`;
        let element = this.invoiceReceipt.nativeElement;
        this.jsPdfService.exportHtml(element, filename);
        this.isDownloading.set(false);
        this.jsPdfService.finished$
          .asObservable()
          .pipe(this._unsubscribe.takeUntilDestroy)
          .subscribe({
            next: (finished) => {
              setTimeout(() => {
                this.loadingService.dismiss();
                if (finished) {
                  let downloadedMessage = this.tr.get(
                    'DEFAULTS.FILE_DOWNLOADED_SUCCESSFULLY'
                  );
                  let viewMessage = this.tr.get('DEFAULTS.VIEW');
                  let merged = zip(downloadedMessage, viewMessage);
                  merged.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
                    next: (messages) => {
                      const [msg1, msg2] = messages;
                      const uri$ = this.jsPdfService.getFileUri(filename);
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
                      });
                    },
                    error: (err) => console.error(err),
                  });
                }
              });
            },
            error: (err) => console.error(err),
          });
      }, 1000);
    });
  }
  openPayFees(event: MouseEvent) {
    const dialog = this._dialog.open(PayWithMpesaComponent, {
      width: '400px',
      data: {
        amount: this.invoice.Pending_Amount,
        description: this.invoice.Fee_Type,
      },
      panelClass: 'm-pesa-panel',
      disableClose: true,
    });
    this._shared.transactionSuccess
      .asObservable()
      .pipe(
        switchMap(() =>
          defer(() =>
            this._router.navigate(['/tabs/tab-1/dashboard'], {
              replaceUrl: true,
            })
          )
        )
      )
      .subscribe({
        next: (value) => value && dialog.close(),
      });
  }
  get pin() {
    return this.formGroup.get('pin') as FormControl;
  }
}
