export class AppUtilities {
  static startsWith(value: string | null | undefined, startWith: string) {
    if (!value) return false;
    return value?.startsWith(startWith);
  }
  static convertToDate(dateString: string): Date | null {
    const [day, month, year] = dateString.split('/').map(Number);
    if (!day || !month || !year || month > 12 || day > 31) {
      console.error('Invalid date format');
      return null;
    }
    return new Date(year, month - 1, day);
  }
}
