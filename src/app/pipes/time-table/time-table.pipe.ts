import { Pipe, PipeTransform } from '@angular/core';
import { AppUtilities } from '../../utils/AppUtilities';
import { GetTimeTable } from 'src/app/models/forms/GetTimeTable';

type DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

@Pipe({
  name: 'isPeriodScheduleType',
  standalone: true,
})
export class PeriodScheduleTypePipe implements PipeTransform {
  static SCHEDULE_PREFIX_PERIOD = 'Period';
  transform(value: string | null | undefined, ...args: any[]) {
    return AppUtilities.startsWith(
      value,
      PeriodScheduleTypePipe.SCHEDULE_PREFIX_PERIOD
    );
  }
}

@Pipe({
  name: 'isBreakScheduleType',
  standalone: true,
})
export class BreakScheduleTypePipe implements PipeTransform {
  static SCHEDULE_PREFIX_BREAK = 'Break';
  transform(value: string | null | undefined, ...args: any[]) {
    return AppUtilities.startsWith(
      value,
      BreakScheduleTypePipe.SCHEDULE_PREFIX_BREAK
    );
  }
}

@Pipe({
  name: 'availableWeekdays',
  standalone: true,
})
export class AvailableWeekdaysPipe implements PipeTransform {
  private _daysOrder = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };
  transform(value: GetTimeTable, ...args: any[]): DAYS_OF_WEEK {
    let sortedDays = Object.entries(this._daysOrder)
      .sort(([, valueA], [, valueB]) => valueA - valueB) // Sort by values
      .map(([key]) => key);
    return sortedDays as DAYS_OF_WEEK;
  }
}

@Pipe({
  name: 'scheduleTypePipe',
  standalone: true,
})
export class ScheduleTypePipe implements PipeTransform {
  transform(value: string | null | undefined, ...args: unknown[]): unknown {
    if (!value) {
      throw Error('Null value for schedule type.');
    }
    let match;
    if (
      value &&
      AppUtilities.startsWith(
        value,
        PeriodScheduleTypePipe.SCHEDULE_PREFIX_PERIOD
      )
    ) {
      match = value.match(/(Period)(\d+)/);
    }
    if (
      value &&
      AppUtilities.startsWith(
        value,
        BreakScheduleTypePipe.SCHEDULE_PREFIX_BREAK
      )
    ) {
      match = value.match(/(Break)(\d+)/);
    }
    if (match) {
      return `${match[1]} ${match[2]}`;
    }
    throw Error('Could not find match for schedule type.');
  }
}

@Pipe({
  name: 'swahiliDayOfWeek',
  standalone: true,
})
export class SwahiliDayOfWeek implements PipeTransform {
  transform(value: string | null | undefined, ...args: any[]) {
    switch (value?.toLocaleLowerCase()) {
      case 'Jumatatu'.toLocaleLowerCase():
        return 'Jt';
      case 'Jumanne'.toLocaleLowerCase():
        return 'Jn';
      case 'Jumatano'.toLocaleLowerCase():
        return 'Jtn';
      case 'Alhamisi'.toLocaleLowerCase():
        return 'Alh';
      case 'Ijumaa'.toLocaleLowerCase():
        return 'Ij';
      case 'Jumamosi'.toLocaleLowerCase():
        return 'Jms';
      default:
        return '';
    }
  }
}
