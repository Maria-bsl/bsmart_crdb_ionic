import { Component, OnInit } from '@angular/core';
import { IonContent, IonText, IonTitle } from '@ionic/angular/standalone';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { TranslateConfigService } from 'src/app/utils/translate-config.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-select-language-page',
  templateUrl: './select-language-page.component.html',
  styleUrls: ['./select-language-page.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    TranslateModule,
    IonText,
    MatButtonModule,
    MatIconModule,
  ],
})
export class SelectLanguagePageComponent implements OnInit {
  constructor(
    private _appConfig: AppConfigService,
    private _trConfig: TranslateConfigService,
    private router: Router
  ) {
    this.registerIcons();
  }
  private registerIcons() {
    const icons: any[] = [['gb', 'tz'], 'assets/custom_svg'];
    this._appConfig.addIcons(['gb', 'tz'], 'assets/custom_svg');
  }
  ngOnInit() {}
  acceptLanguage(event: MouseEvent, code: string) {
    if (code !== this._trConfig.currentLanguage) {
      this._trConfig.language = code;
    }
    this.router.navigate(['/login']);
  }
}
