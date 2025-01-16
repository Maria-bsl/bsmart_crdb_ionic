import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonContent, IonButton, IonText } from '@ionic/angular/standalone';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [IonText, IonButton, RouterOutlet, IonContent, NgOptimizedImage],
})
export class AuthComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
