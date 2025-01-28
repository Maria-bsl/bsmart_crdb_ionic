import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Router } from '@angular/router';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';

@Component({
  selector: 'app-select-profile-form',
  templateUrl: './select-profile-form.component.html',
  styleUrls: ['./select-profile-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    MatIconModule,
    MatListModule,
    MatRippleModule,
    TranslateModule,
    HeaderSectionComponent,
  ],
})
export class SelectProfileFormComponent {
  constructor(
    private _appConfig: AppConfigService,
    private _tr: TranslateService,
    private _unsubscribe: UnsubscribeService,
    private router: Router,
    private _location: Location,
    private navCtrl: NavController
  ) {
    this.registerIcons();
    const backButton = () => {
      const backToLogin = () =>
        this.navCtrl.navigateRoot('/tabs/tab-1/dashboard');
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    backButton();
  }
  private registerIcons() {
    this._appConfig.addIcons(
      [
        'person-fill',
        'person-check-fill',
        'lock-fill',
        'unlock-fill',
        'chevron-right',
      ],
      '/assets/bootstrap-icons'
    );
  }
  openEditProfilePage(event: MouseEvent) {
    this._tr
      .get('HOME_PAGE.LABELS.PROFILE')
      .pipe(this._unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/profile/edit'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (e) => console.error(e),
      });
  }
  openChangePasswordPage(event: MouseEvent) {
    this._tr
      .get('PROFILE_PAGE.LABELS.CHANGE_PASSWORD_TEXT')
      .pipe(this._unsubscribe.takeUntilDestroy)
      .subscribe({
        next: (message) => {
          this.router.navigate(['/tabs/profile/change-password'], {
            queryParams: {
              'show-back-button': true,
              'page-title': message,
            },
          });
        },
        error: (e) => console.error(e),
      });
  }
}
