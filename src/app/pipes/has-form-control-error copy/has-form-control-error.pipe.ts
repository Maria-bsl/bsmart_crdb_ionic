import { Pipe, PipeTransform } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Pipe({
  name: 'hasFormControlError',
  standalone: true,
  pure: false,
})
export class HasFormControlErrorPipe implements PipeTransform {
  transform(
    control: AbstractControl | FormControl | null,
    errorName: string
  ): unknown {
    if (!control || !control.errors) {
      return false;
    }
    if (control.errors[errorName]) {
      return control && control.invalid && control.touched && true;
    }
    return false;
  }
}
