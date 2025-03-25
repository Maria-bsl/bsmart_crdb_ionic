import { Pipe, PipeTransform } from '@angular/core';
import { defaultIfEmpty, filter, map, Observable, shareReplay } from 'rxjs';
import { GetSDetails } from 'src/app/models/responses/RGetSDetails';
import { RParentDetail } from 'src/app/models/responses/RParentDetails';

function getStudentDetails$(
  studentDetails$: Observable<GetSDetails | RParentDetail | null>
) {
  return studentDetails$?.pipe(
    filter((value): value is RParentDetail => !!value)
  );
}

@Pipe({
  name: 'isExpiredPackage',
  standalone: true,
})
export class IsExpiredPackagePipe implements PipeTransform {
  transform(
    studentDetails$: Observable<GetSDetails | RParentDetail | null>
  ): Observable<boolean> {
    return getStudentDetails$(studentDetails$).pipe(
      defaultIfEmpty(false),
      map((value) => true),
      shareReplay(1)
    );
  }
}

@Pipe({
  name: 'getParentName',
  standalone: true,
})
export class GetParentNamePipe implements PipeTransform {
  transform(
    studentDetails$: Observable<GetSDetails | RParentDetail | null>,
    ...args: any[]
  ): Observable<string | null> {
    return getStudentDetails$(studentDetails$).pipe(
      defaultIfEmpty(''),
      map((value) => (value as RParentDetail).Parent_Name)
    );
  }
}
