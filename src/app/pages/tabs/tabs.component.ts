import { Component, OnInit } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonContent,
  IonRouterOutlet,
} from '@ionic/angular/standalone';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import {
  home,
  people,
  scan,
  busOutline,
  cubeOutline,
  personOutline,
} from 'ionicons/icons';
import { TranslateModule } from '@ngx-translate/core';
import { addIcons } from 'ionicons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    IonRouterOutlet,
    IonContent,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    TranslateModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class TabsComponent {
  constructor() {
    addIcons({ home, scan, people, busOutline, cubeOutline, personOutline });
  }
}
