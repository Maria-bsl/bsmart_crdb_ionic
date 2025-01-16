import { Component, Inject, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-message-box-dialog',
  templateUrl: './message-box-dialog.component.html',
  styleUrls: ['./message-box-dialog.component.scss'],
  standalone: true,
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    TranslateModule,
    MatDividerModule,
    MatButtonModule,
  ],
})
export class MessageBoxDialogComponent implements OnInit {
  constructor(
    private readonly dialogRef: MatDialogRef<MessageBoxDialogComponent>,
    @Inject(MAT_DIALOG_DATA)
    public readonly data: { title: string; message: string }
  ) {}

  ngOnInit() {}
}
