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
import { Observable } from 'rxjs';
import { RParentDetail } from 'src/app/models/responses/RParentDetails';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { NavController } from '@ionic/angular/standalone';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { LoadingService } from 'src/app/services/loading-service/loading.service';

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
  parentDetails$!: Observable<RParentDetail>;
  @Input() s_showBackButton = false;
  @Input() s_pageTitle = '';
  constructor(
    private _appConfig: AppConfigService,
    private activatedRoute: ActivatedRoute,
    private navCtrl: NavController,
    private _unsubscribe: UnsubscribeService,
    private loadingService: LoadingService,
    private router: Router
  ) {
    this.init();
  }
  private init() {
    const assignParentDet = () => {
      this.parentDetails$ = new Observable((subs) => {
        subs.next(JSON.parse(localStorage.getItem('GetParentDet')!));
        subs.complete();
      });
    };
    this.activatedRoute.queryParams.subscribe((params) => {
      if (params['show-back-button']) {
        this.s_showBackButton = params['show-back-button'] as boolean;
        //this.s_showBackButton.set(params['show-back-button']);
      }
      if (params['page-title']) {
        this.s_pageTitle = params['page-title'];
        //this.s_pageTitle.set(params['page-title']);
      }
    });
    this.registerIcons();
    assignParentDet();
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
              this.loadingService.startLoading().then((loading) => {
                localStorage.clear();
                setTimeout(() => {
                  this.loadingService.dismiss();
                  this.router.navigate(['/login']);
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
}
