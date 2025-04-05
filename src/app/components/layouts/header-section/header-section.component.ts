import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import {
  catchError,
  delay,
  finalize,
  map,
  Observable,
  shareReplay,
  switchMap,
} from 'rxjs';
import { RParentDetail } from 'src/app/models/responses/RParentDetails';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { NavController } from '@ionic/angular/standalone';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import {
  filterNotNull,
  LoadingService,
} from 'src/app/services/loading-service/loading.service';
import { ApiService } from 'src/app/services/api-service/api.service';
import { load } from 'google-maps';
import { SharedService } from 'src/app/services/shared-service/shared.service';

@Component({
  selector: 'app-header-section',
  templateUrl: './header-section.component.html',
  styleUrls: ['./header-section.component.scss'],
  standalone: true,
  imports: [
    MatToolbarModule,
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    RouterLink,
  ],
})
export class HeaderSectionComponent {
  @Input() s_showBackButton = false;
  @Input() s_pageTitle = '';
  @Input() canClickProfile: boolean = true;
  @Input() isTransparent: boolean = false;
  constructor(
    private _appConfig: AppConfigService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private _unsubscribe: UnsubscribeService,
    private _loading: LoadingService,
    private router: Router,
    private _api: ApiService,
    private _shared: SharedService
  ) {
    this.init();
  }
  private init() {
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['show-back-button']) {
        this.s_showBackButton = params['show-back-button'] as boolean;
      }
      if (params['page-title']) {
        this.s_pageTitle = params['page-title'];
      }
    });
    this.registerIcons();
    // if (!this._shared.parentDetails$) {
    //   this._shared.requestParentDetails();
    // }
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
  goBack(event: MouseEvent) {
    this._appConfig.goBack();
  }
  switchAccountClicked(event: MouseEvent) {
    this.navCtrl.navigateRoot('/home');
  }
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
                  this.router.navigate(['/login']).then(() => {
                    Object.keys(localStorage).forEach((key) =>
                      localStorage.removeItem(key)
                    );
                  });
                }, 680);
              });
            },
          });
      },
      error: (e) => console.error(e),
    });
  }
  navigateHome(event: MouseEvent) {
    const url = location.pathname;
    if (url.includes('package')) {
      this.goBack(event);
    } else {
      this.router.navigate(['/tabs/tab-1/dashboard']);
    }
  }
  get parentDetails$() {
    return this._shared.parentDetails$;
  }
}
