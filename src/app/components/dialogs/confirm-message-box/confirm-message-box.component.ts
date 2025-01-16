import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MessageBoxDialogComponent } from '../message-box-dialog/message-box-dialog.component';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { IonText, IonTitle } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-confirm-message-box',
  templateUrl: './confirm-message-box.component.html',
  styleUrls: ['./confirm-message-box.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    MatDividerModule,
    MatIconModule,
    IonText,
    IonTitle,
    TranslateModule,
  ],
})
export class ConfirmMessageBoxComponent implements OnInit {
  confirmed = new EventEmitter<void>();
  constructor(
    private readonly dialogRef: MatDialogRef<MessageBoxDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public readonly data: {
      title: string;
      message: string;
    }
  ) {}

  ngOnInit() {}
  confirmClicked() {
    this.confirmed.emit();
  }
}
