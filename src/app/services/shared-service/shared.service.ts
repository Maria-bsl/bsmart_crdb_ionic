import { Injectable } from '@angular/core';
import {
  catchError,
  delay,
  finalize,
  map,
  Observable,
  shareReplay,
  switchMap,
} from 'rxjs';
import { RParentDetail } from 'src/app/models/responses/RParentDetails';
import {
  filterNotNull,
  LoadingService,
} from '../loading-service/loading.service';
import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';
import { ApiService } from '../api-service/api.service';

@Injectable({
  providedIn: 'root',
})
export class SharedService {
  parentDetails$!: Observable<RParentDetail>;
  constructor(
    private _loading: LoadingService,
    private _unsubscribe: UnsubscribeService,
    private _api: ApiService
  ) {
    //this.requestParentDetails();
  }
  requestParentDetails() {
    this.parentDetails$ = this._loading
      .open()
      .pipe(
        this._unsubscribe.takeUntilDestroy,
        switchMap((loading) =>
          this._api
            .getParentDetails({
              User_Name: localStorage.getItem('User_Name')!,
            })
            .pipe(
              finalize(() => loading && loading.close()),
              catchError(async () => {})
            )
        )
      )
      .pipe(
        filterNotNull(),
        map((data) => data[0]),
        shareReplay({ bufferSize: 1, refCount: true })
      );
  }
}
