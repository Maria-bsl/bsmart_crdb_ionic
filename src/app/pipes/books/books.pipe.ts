import { Pipe, PipeTransform } from '@angular/core';
import { Observable } from 'rxjs';
import { ISubjectBook } from 'src/app/models/forms/isubjects';

@Pipe({
  name: 'isExistSubjectBooks',
  standalone: true,
  pure: false,
})
export class IsExistSubjectBooksPipe implements PipeTransform {
  transform(subject: (Observable<ISubjectBook[]> | null)[], ...args: number[]) {
    return (
      subject.length > 0 &&
      subject.at(args[0]) !== null &&
      subject.at(args[0]) !== undefined
    );
  }
}

@Pipe({ name: 'isNotNullSubjectBooks', standalone: true, pure: true })
export class IsNotNullSubjectBooksPipe implements PipeTransform {
  transform(subject: ISubjectBook[] | null | undefined, ...args: number[]) {
    return subject !== null && subject !== undefined && subject.length > 0;
  }
}
