import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonTitle, IonContent, IonText } from '@ionic/angular/standalone';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { v4 } from 'uuid';
import { PayWithMpesaService } from 'src/app/services/pay-with-mpesa/pay-with-mpesa.service';
import { IPackage } from 'src/app/models/forms/package.model';
import { AppConst } from 'src/app/utils/app-const';
import { HasFormControlErrorPipe } from 'src/app/pipes/has-form-control-error/has-form-control-error.pipe';
import { C2BMpesaPayment } from 'src/app/models/forms/mpesa.model';
import { inOutAnimation } from 'src/app/shared/fade-in-out-animation';

@Component({
  selector: 'app-pay-with-mpesa',
  templateUrl: './pay-with-mpesa.component.html',
  styleUrls: ['./pay-with-mpesa.component.scss'],
  standalone: true,
  imports: [
    IonTitle,
    IonContent,
    IonText,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogClose,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ReactiveFormsModule,
    HasFormControlErrorPipe,
  ],
  animations: [inOutAnimation],
})
export class PayWithMpesaComponent implements OnInit, OnDestroy {
  payFormGroup!: FormGroup;
  constructor(
    private fb: FormBuilder,
    private _appConfig: AppConfigService,
    private tr: TranslateService,
    public mpesaService: PayWithMpesaService,
    private readonly dialogRef: MatDialogRef<PayWithMpesaComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      amount: number | undefined;
      description?: string | undefined;
      package: IPackage | undefined;
    }
  ) {
    this.registerIcons();
    const backButton = () => {
      const backToLogin = () =>
        this.mpesaService.isLoading()
          ? new Promise((resolve) => resolve(1))
          : new Promise((resolve) => resolve(this.dialogRef.close()));
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
  }
  private async createFormGroup() {
    this.payFormGroup = this.fb.group({
      input_Amount: this.fb.control(this.data.amount, [Validators.required]),
      input_Country: this.fb.control('TZN', [Validators.required]),
      input_Currency: this.fb.control('TZS', [Validators.required]),
      input_CustomerMSISDN: this.fb.control('', [
        Validators.required,
        Validators.pattern(AppConst.TANZANIA_MOBILE_NUMBER_REGEX),
      ]),
      input_ServiceProviderCode: this.fb.control('000000', [
        Validators.required,
      ]),
      input_ThirdPartyConversationID: this.fb.control('', []),
      input_TransactionReference: this.fb.control('T1234C', [
        Validators.required,
      ]),
      input_PurchasedItemsDesc: this.fb.control('', []),
    });
  }
  private registerIcons() {
    this._appConfig.addIcons(['x-lg'], '/assets/bootstrap-icons');
  }
  ngOnInit() {
    this.createFormGroup();
  }
  submitPayWithMpesaForm(event: any) {
    if (this.payFormGroup.valid) {
      this.input_PurchasedItemsDesc.setValue(this.data.description);
      this.input_ThirdPartyConversationID.setValue(v4().replaceAll('-', ''));
      const entries = new Map(
        Object.entries(this.payFormGroup.value as C2BMpesaPayment)
      );
      entries.set(
        'input_CustomerMSISDN',
        '255' + entries.get('input_CustomerMSISDN')
      );
      this.mpesaService.makeC2BPayment(
        Object.fromEntries(entries) as C2BMpesaPayment
      );
    } else {
      this.payFormGroup.markAllAsTouched();
    }
  }
  ngOnDestroy(): void {
    this.mpesaService.isLoading.set(false);
  }
  get input_Amount() {
    return this.payFormGroup.get('input_Amount') as FormControl;
  }
  get input_Country() {
    return this.payFormGroup.get('input_Country') as FormControl;
  }
  get input_Currency() {
    return this.payFormGroup.get('input_Currency') as FormControl;
  }
  get input_CustomerMSISDN() {
    return this.payFormGroup.get('input_CustomerMSISDN') as FormControl;
  }
  get input_ServiceProviderCode() {
    return this.payFormGroup.get('input_ServiceProviderCode') as FormControl;
  }
  get input_ThirdPartyConversationID() {
    return this.payFormGroup.get(
      'input_ThirdPartyConversationID'
    ) as FormControl;
  }
  get input_TransactionReference() {
    return this.payFormGroup.get('input_TransactionReference') as FormControl;
  }
  get input_PurchasedItemsDesc() {
    return this.payFormGroup.get('input_PurchasedItemsDesc') as FormControl;
  }
}
