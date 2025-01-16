export class Schedule {
  Type!: string | null | undefined;
  Time!: string | null | undefined;
  Subject!: string | null | undefined;
  Teacher!: string | null | undefined;
  isPeriodSchedule() {
    return (
      this.Type !== null &&
      this.Type !== undefined &&
      this.Type.startsWith('Period')
    );
  }
  isBreakSchedule() {
    return (
      this.Type !== null &&
      this.Type !== undefined &&
      this.Type.startsWith('Break')
    );
  }
  isEmpty() {
    return (
      this.Type === undefined &&
      this.Time === undefined &&
      this.Subject === undefined &&
      this.Teacher === undefined
    );
  }
}

export class GetTimeTable {
  Monday!: Schedule[] | null;
  Tuesday!: Schedule[] | null;
  Wednesday!: Schedule[] | null;
  Thursday!: Schedule[] | null;
  Friday!: Schedule[] | null;
  Saturday!: Schedule[] | null;
  Status!: string | null;
}
