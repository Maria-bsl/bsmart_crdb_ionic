import { CommonModule, Location } from '@angular/common';
import {
  AfterViewInit,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  NO_ERRORS_SCHEMA,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonText,
  NavController,
} from '@ionic/angular/standalone';
import { TranslateModule } from '@ngx-translate/core';
import { finalize, Observable, switchMap, tap } from 'rxjs';
import { RouteDetail, VehicleDetail } from 'src/app/models/forms/transports';
import { inOutAnimation } from 'src/app/shared/fade-in-out-animation';
import { GoogleMap } from '@capacitor/google-maps';
import { GetSDetailStudents } from 'src/app/models/responses/RGetSDetails';
import { LoadingService } from 'src/app/services/loading-service/loading.service';
import { AppConfigService } from 'src/app/services/app-config/app-config.service';
import { ApiService } from 'src/app/services/api-service/api.service';
import { UnsubscribeService } from 'src/app/services/unsubscriber/unsubscriber.service';
import { Geolocation } from '@capacitor/geolocation';
import { environment } from 'src/environments/environment';
import { FTimeTableForm as StudentDetailsForm } from 'src/app/models/forms/f-time-table-form';
import { google } from 'google-maps';
import { Router } from '@angular/router';

@Component({
  selector: 'app-maps-form',
  templateUrl: './maps-form.component.html',
  styleUrls: ['./maps-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonButtons,
    IonBackButton,
    IonText,
    MatToolbarModule,
    MatDividerModule,
    TranslateModule,
    MatButtonModule,
    MatIconModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
  animations: [inOutAnimation],
})
export class MapsFormComponent implements AfterViewInit, OnDestroy {
  @ViewChild('capacitorGoogleMap') capacitorGoogleMap!: ElementRef;
  @ViewChild('swipeDiv') swipeDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('swipeContainer') swipeContainer!: ElementRef<HTMLDivElement>;
  vehicleDetails$!: Observable<VehicleDetail[]>;
  routeDetail$!: Observable<RouteDetail[]>;
  newMap!: GoogleMap;
  selectedStudent$!: Observable<GetSDetailStudents>;
  constructor(
    private loadingService: LoadingService,
    private _appConfig: AppConfigService,
    private apiService: ApiService,
    private _unsubscribe: UnsubscribeService,
    private navCtrl: NavController,
    private _location: Location,
    private router: Router
  ) {
    this.registerIcons();
    this.init();
  }
  private registerIcons() {
    let icons = ['telephone-fill'];
    this._appConfig.addIcons(icons, '/assets/bootstrap-icons');
  }
  private init() {
    const backButton = () => {
      const backToLogin = () =>
        this.navCtrl.navigateRoot('/tabs/tab-1/dashboard');
      this._appConfig.backButtonEventHandler(backToLogin);
    };
    const createSelectedStudent = () => {
      this.selectedStudent$ = new Observable((subs) => {
        subs.next(JSON.parse(localStorage.getItem('selectedStudent')!));
        subs.complete();
      });
    };
    createSelectedStudent();
    backButton();
  }
  private async getCurrentPosition(): Promise<{ lat: number; long: number }> {
    const coordinates = await Geolocation.getCurrentPosition();
    return new Promise((resolve, reject) => {
      return resolve({
        lat: coordinates.coords.latitude,
        long: coordinates.coords.longitude,
      });
    });
  }
  private async initGoogleMap() {
    let mapsContainer = this.capacitorGoogleMap.nativeElement;
    const coordinates = await this.getCurrentPosition();
    this.newMap = await GoogleMap.create({
      id: 'google-map',
      element: mapsContainer,
      apiKey: environment.googleMapApiKey,
      config: {
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoom: 18,
        center: {
          lat: coordinates.lat,
          lng: coordinates.long,
        },
      },
    });
    //const biz = { lat: -6.804507, lng: 39.276025 };
    const cameraId = await this.newMap.setCamera({
      coordinate: {
        lat: coordinates.lat,
        lng: coordinates.long,
      },
    });
    const markerId = await this.newMap.addMarker({
      coordinate: {
        lat: coordinates.lat,
        lng: coordinates.long,
      },
    });
  }
  private createSlideUpAnimation() {
    let swipeDiv = this.swipeDiv.nativeElement;
    let initialClass = 'h-20';
    let targetClass = 'h-[340px]';
    const exists = (classList: DOMTokenList) => {
      if (classList.contains(initialClass)) {
        classList.remove(initialClass);
        classList.add(targetClass);
      } else if (classList.contains(targetClass)) {
        classList.remove(targetClass);
        classList.add(initialClass);
      } else {
      }
    };
    swipeDiv.addEventListener('click', (e) => {
      exists(this.swipeContainer.nativeElement.classList);
    });
  }
  private requestGetRoute() {
    const createVehicleDetails = (vehicles: VehicleDetail[]) => {
      this.vehicleDetails$ = new Observable((subscriber) => {
        subscriber.next(vehicles);
        subscriber.complete();
      });
    };
    const createRouteDetails = (routes: RouteDetail[]) => {
      this.routeDetail$ = new Observable((subscriber) => {
        subscriber.next(routes);
        subscriber.complete();
      });
    };
    this.selectedStudent$.pipe(this._unsubscribe.takeUntilDestroy).subscribe({
      next: (selectedStudent) => {
        const body: StudentDetailsForm = {
          Facility_Reg_Sno: selectedStudent.Facility_Reg_Sno.toString(),
          Admission_No: selectedStudent.Admission_No,
          From_Date: undefined,
          To_Date: undefined,
        };
        this.loadingService.startLoading().then((loading) => {
          this.apiService
            .getRoute(body)
            .pipe(
              tap((res) => createVehicleDetails(res)),
              switchMap((res) =>
                this.apiService.getRouteDetails({
                  Facility_Reg_Sno: selectedStudent.Facility_Reg_Sno.toString(),
                  Route_ID: res[0].Route_ID,
                })
              ),
              tap((res) => createRouteDetails(res)),
              finalize(() => this.loadingService.dismiss())
            )
            .subscribe();
        });
      },
      error: (e) => console.error(e),
    });
  }
  ngAfterViewInit(): void {
    this.initGoogleMap();
    this.createSlideUpAnimation();
    this.requestGetRoute();
  }
  ngOnDestroy(): void {
    this.newMap.destroy();
  }
  openTelephone(phoneNumber: string) {
    let prefix = '+255';
    window.open(`tel:${prefix}${phoneNumber}`);
  }
}
