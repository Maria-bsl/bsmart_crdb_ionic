import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  signal,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { MatTabsModule } from '@angular/material/tabs';
import { FeesPageService } from 'src/app/services/fees-page-service/fees-page.service';
import { MatCard } from '@angular/material/card';
import { map, Observable } from 'rxjs';
import { AppUtilities } from 'src/app/utils/AppUtilities';
import { CommonModule, Location } from '@angular/common';
import { InvoiceReceiptComponent } from 'src/app/components/templates/invoice-receipt/invoice-receipt.component';
import { ActivatedRoute } from '@angular/router';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';

@Component({
  selector: 'app-fees-form',
  templateUrl: './fees-form.component.html',
  styleUrls: ['./fees-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    HeaderSectionComponent,
    TranslateModule,
    MatTabsModule,
    CommonModule,
    InvoiceReceiptComponent,
  ],
})
export class FeesFormComponent {
  studentInvoices$ = this.feesService.studentInvoices$.asObservable().pipe(
    map((invoices) =>
      invoices.map((invoice) => {
        return {
          ...invoice,
          Invoice_Date: AppUtilities.convertToDate(
            invoice.Invoice_Date as string
          ),
        };
      })
    )
  );
  studentPendingInvoices$ = this.feesService.studentPendingInvoices$
    .asObservable()
    .pipe(
      map((invoices) =>
        invoices.map((invoice) => {
          return {
            ...invoice,
            Expired_Date: AppUtilities.convertToDate(
              invoice.Expired_Date as string
            ),
          };
        })
      )
    );
  studentPaidInvoice$ = this.feesService.studentPaidInvoice$
    .asObservable()
    .pipe(
      map((invoices) =>
        invoices.map((invoice) => {
          return {
            ...invoice,
            Expired_Date: AppUtilities.convertToDate(
              invoice.Paid_Date as string
            ),
          };
        })
      )
    );
  tabCurrentIndex$!: Observable<number>;
  constructor(
    private _appConfig: AppConfigService,
    private navCtrl: NavController,
    private feesService: FeesPageService,
    private activatedRoute: ActivatedRoute,
    private _unsubscribe: UnsubscribeService,
    private _location: Location
  ) {
    this.init();
    this.registerIcons();
    this.feesService.initFeesPage();
  }
  private init() {
    const backButton = () => {
      const backToLogin = () =>
        this.navCtrl.navigateRoot('/tabs/tab-1/dashboard');

      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
    this.activatedRoute.queryParams
      .pipe(this._unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (params) => {
          this.tabCurrentIndex$ = new Observable((subs) => {
            const pending = params['is-pending-fee'] !== undefined ? 1 : 0;
            subs.next(pending);
            subs.complete();
          });
        },
        error: (e) => console.error(e),
      });
  }
  private registerIcons() {
    let icons = ['arrow-right', 'download'];
    this._appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
}
