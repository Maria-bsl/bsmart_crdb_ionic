import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppConst } from './app-const';

@Injectable({
  providedIn: 'root',
})
export class TranslateConfigService {
  currentLang: string | null = localStorage.getItem(AppConst.CURRENT_LANG);

  constructor(private _tr: TranslateService) {}

  set language(code: string) {
    this._tr.use(code);
    localStorage.setItem(AppConst.CURRENT_LANG, code);
  }

  get defaultLanguage() {
    return this._tr.getDefaultLang();
  }

  get currentLanguage() {
    return localStorage.getItem(AppConst.CURRENT_LANG);
  }
}
