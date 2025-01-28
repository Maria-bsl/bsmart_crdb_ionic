import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { IonContent } from '@ionic/angular/standalone';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-package-page',
  templateUrl: './package-page.component.html',
  styleUrls: ['./package-page.component.scss'],
  standalone: true,
  imports: [IonContent, RouterOutlet],
})
export class PackagePageComponent {
  constructor() {}
}
