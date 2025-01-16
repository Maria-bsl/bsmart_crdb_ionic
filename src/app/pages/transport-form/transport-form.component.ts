import { Component, OnInit } from '@angular/core';
import { IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-transport-form',
  templateUrl: './transport-form.component.html',
  styleUrls: ['./transport-form.component.scss'],
  standalone: true,
  imports: [IonRouterOutlet],
})
export class TransportFormComponent implements OnInit {
  constructor() {}

  ngOnInit() {}
}
