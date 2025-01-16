import { Pipe, PipeTransform } from '@angular/core';
import { IStudentMarks } from 'src/app/models/forms/StudentMarks';

@Pipe({
  name: 'toBase64',
  standalone: true,
  pure: true,
})
export class ToBase64Pipe implements PipeTransform {
  transform(value: number, ...args: any[]) {
    return btoa(value.toString());
  }
}

@Pipe({
  name: 'isBelowAverage',
  standalone: true,
  pure: true,
})
export class BelowAveragePipe implements PipeTransform {
  transform(value: IStudentMarks, ...args: any[]) {
    let average = 50.0;
    if (value.Average && value.Average.includes('%')) {
      let percent = value.Average.substring(0, value.Average.indexOf('%'));
      return Number(percent) < average;
    }
    throw Error('Invalid Average value in BelowAveragePipe');
  }
}

@Pipe({
  name: 'isAboveAverage',
  standalone: true,
  pure: true,
})
export class AboveAveragePipe implements PipeTransform {
  transform(value: IStudentMarks, ...args: unknown[]): boolean {
    let average = 50.0;
    let bestAverage = 75.0;
    if (value.Average && value.Average.includes('%')) {
      let percent = value.Average.substring(0, value.Average.indexOf('%'));
      return Number(percent) >= average && Number(percent) < bestAverage;
    }
    throw Error('Invalid Average value in AboveAveragePipe');
  }
}

@Pipe({
  name: 'isGreatAverage',
  standalone: true,
  pure: true,
})
export class GreatAveragePipe implements PipeTransform {
  transform(value: IStudentMarks, ...args: any[]) {
    let average = 75.0;
    if (value.Average && value.Average.includes('%')) {
      let percent = value.Average.substring(0, value.Average.indexOf('%'));
      return Number(percent) >= average;
    }
    throw Error('Invalid Average value in GreatAveragePipe');
  }
}
