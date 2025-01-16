import { Component, OnInit } from '@angular/core';
import { IonContent, IonRouterOutlet } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-results-form',
  templateUrl: './results-form.component.html',
  styleUrls: ['./results-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    HeaderSectionComponent,
    TranslateModule,
    MatListModule,
    MatIconModule,
    IonRouterOutlet,
    RouterOutlet,
  ],
})
export class ResultsFormComponent {
  constructor() {}
}
