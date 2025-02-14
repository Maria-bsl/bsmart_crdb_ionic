import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { IonContent, NavController } from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { HeaderSectionComponent } from 'src/app/components/layouts/header-section/header-section.component';
import { RParentDetail } from 'src/app/models/responses/RParentDetails';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { StudentDetailsFormService } from 'src/app/services/student-details-form-service/student-details-form.service';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-add-student-form',
  templateUrl: './add-student-form.component.html',
  styleUrls: ['./add-student-form.component.scss'],
  standalone: true,
  imports: [
    IonContent,
    TranslateModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatAutocompleteModule,
    CommonModule,
    HeaderSectionComponent,
    ReactiveFormsModule,
    IonButton,
  ],
})
export class AddStudentFormComponent {
  constructor(
    private navCtrl: NavController,
    private _appConfig: AppConfigService,
    public studentRegService: StudentDetailsFormService
  ) {
    this.init();
    this.studentRegService.requestFacultiesList();
  }
  private init() {
    const backButton = () => {
      const backToLogin = () => this.navCtrl.navigateRoot('/home');
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    this.registerIcons();
    backButton();
  }
  private registerIcons() {
    const icons = ['box-arrow-right', 'trash', 'gear'];
    this._appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
  submitStudentForm(event: any) {
    this.studentRegService.submitForm();
  }
}
