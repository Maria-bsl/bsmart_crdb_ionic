import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { LoadingDialogComponent } from '../../components/dialogs/loading-dialog/loading-dialog.component';
import {
  BehaviorSubject,
  concatMap,
  defer,
  filter,
  firstValueFrom,
  lastValueFrom,
  map,
  Observable,
  of,
  OperatorFunction,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { UnsubscribeService } from '../unsubscriber/unsubscriber.service';

export const filterNotNull =
  <T>(): OperatorFunction<T, Exclude<T, null | undefined | void>> =>
  (source$) =>
    source$.pipe(filter((value) => !!value)) as Observable<
      Exclude<T, null | undefined | void>
    >;

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  loading$ = new BehaviorSubject<
    false | MatDialogRef<LoadingDialogComponent, any>
  >(false);
  constructor(
    private readonly _dialog: MatDialog,
    private unsubscribe: UnsubscribeService
  ) {}
  private stopLoading() {
    let promise = firstValueFrom(this.loading$.asObservable());
    promise
      .then((loading: boolean | MatDialogRef<LoadingDialogComponent, any>) => {
        if (loading) {
          let ref = loading as MatDialogRef<LoadingDialogComponent, any>;
          ref.close();
          this.loading$.next(false);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }
  async startLoading() {
    let isLoading = await this.isLoading();
    if (isLoading) this.stopLoading();
    let dialogRef = this._dialog.open(LoadingDialogComponent, {
      panelClass: 'dialog-loading-panel-class',
      disableClose: true,
    });
    this.loading$.next(dialogRef);
    const TIMEOUT = 30000;
    setTimeout(async () => {
      if (await this.isLoading()) {
        this.stopLoading();
      }
    }, TIMEOUT);
    return firstValueFrom(this.loading$.asObservable());
  }
  open(timeout = 30000): Observable<MatDialogRef<LoadingDialogComponent, any>> {
    const dialogRef = () =>
      this._dialog.open(LoadingDialogComponent, {
        panelClass: 'dialog-loading-panel-class',
        disableClose: true,
      });
    return defer(() => of(dialogRef)).pipe(
      map((ref) => ref()),
      tap((loading) =>
        timer(timeout).subscribe((next) => loading && loading.close())
      )
    );
  }
  dismiss() {
    this.stopLoading();
  }
  async isLoading() {
    let loading = await firstValueFrom(this.loading$.asObservable());
    return loading ? true : false;
  }
}
