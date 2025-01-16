import { Component, OnInit } from '@angular/core';
import { IonContent, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
  standalone: true,
  imports: [IonRouterOutlet],
})
export class ProfileFormComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
