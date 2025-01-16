import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'accumulateArrayValue',
  standalone: true,
})
export class AccumulateStudentInvoicePipe implements PipeTransform {
  transform(invoices: any[], key: string): number {
    return invoices.reduce((sum, student) => sum + student[key], 0);
  }
}
