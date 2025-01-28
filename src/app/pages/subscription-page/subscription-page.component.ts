import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterOutlet } from '@angular/router';
import {
  IonContent,
  IonButtons,
  IonBackButton,
  IonTitle,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { firstValueFrom, Observable, of } from 'rxjs';
import { PayWithMpesaComponent } from 'src/app/components/dialogs/pay-with-mpesa/pay-with-mpesa.component';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { IPackage } from 'src/app/models/forms/package.model';
import {
  FindPackagePipe,
  SwitchPackageNamePipe,
} from 'src/app/pipes/is-empty-shelf/is-empty-shelf.pipe';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscription-page',
  templateUrl: './subscription-page.component.html',
  styleUrls: ['./subscription-page.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButtons,
    IonBackButton,
    IonText,
    RouterOutlet,
    MatToolbarModule,
    MatIconModule,
    TranslateModule,
    MatCardModule,
    FindPackagePipe,
    CommonModule,
    IonTitle,
    SwitchPackageNamePipe,
    MatTabsModule,
    MatButtonModule,
    MatRippleModule,
    HeaderSectionComponent,
    MatChipsModule,
  ],
})
export class SubscriptionPageComponent implements OnInit {
  package$!: Observable<IPackage>;
  constructor(
    private tr: TranslateService,
    private appConfig: AppConfigService,
    private _dialog: MatDialog,
    private unsubscribe: UnsubscribeService,
    private navCtrl: NavController,
    private location: Location
  ) {
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
  private failedToOpenPaymentMethodErrorMessage() {
    let title = 'defaults.warning';
    let message = 'subscriptionPage.errors.failedToOpenPaymentMethod';
    this.appConfig.openAlertMessageBox(title, message);
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
    dialog.componentInstance.mpesaService.transactionCompleted
      .asObservable()
      .pipe(this.unsubscribe.takeUntilDestroy)
      .subscribe({
        next: async (isSuccess) => {
          if (isSuccess) {
            dialog.close();
          }
        },
      });
  }
  ngOnInit() {
    if (history.state['package']) {
      this.package$ = of(history.state['package']);
    }
  }
  openPayWithMpesa() {
    if (this.package$) {
      let found = firstValueFrom(this.package$);
      found
        .then((saved) => {
          this.payWithMpesa(saved);
        })
        .catch((err) => {
          this.failedToOpenPaymentMethodErrorMessage();
        });
    } else {
      this.failedToOpenPaymentMethodErrorMessage();
      throw Error('Package not found in history state');
    }
  }
}
