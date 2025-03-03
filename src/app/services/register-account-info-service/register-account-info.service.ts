import { Injectable } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { AppConst } from 'src/app/utils/app-const';

@Injectable({
  providedIn: 'root',
})
export class RegisterAccountInfoService {
  parentForm: FormGroup = this.fb.group({
    User_Name: this.fb.control<string>('', [Validators.required]),
    Email_Address: this.fb.control<string>('', [
      Validators.required,
      Validators.pattern(/^$|\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/),
      //Validators.email,
    ]),
    Parent_Name: this.fb.control<string>('', [Validators.required]),
    Mobile_No: this.fb.control<string>('', [
      Validators.required,
      Validators.pattern(AppConst.TANZANIA_MOBILE_NUMBER_REGEX),
    ]),
  });
  constructor(private fb: FormBuilder) {}
  validateForm(errors: { title: string; message: string }) {
    const basePath = 'REGISTER.REGISTER_FORM.ERRORS';
    if (this.Parent_Name.invalid) {
      errors.message = `${basePath}.MISSING_FULL_NAME`;
    } else if (this.Mobile_No.invalid) {
      this.Mobile_No.hasError('required') &&
        (errors.message = `${basePath}.MISSING_PHONE_NUMBER`);
      this.Mobile_No.hasError('pattern') &&
        (errors.message = `${basePath}.INVAID_PHONE_NUMBER`);
    } else if (this.User_Name.invalid) {
      errors.message = `${basePath}.MISSING_USERNAME`;
    } else if (this.Email_Address.invalid) {
      this.Email_Address.hasError('required') &&
        (errors.message = `${basePath}.MISSING_EMAIL_ADDRESS`);
      this.Email_Address.hasError('email') &&
        (errors.message = `${basePath}.INVALID_EMAIL`);
    } else {
    }
  }
  //returns form details as map if form is valid
  getRegisterParentMap() {
    const details = new Map<string, any>();
    let errors = { title: '', message: '' };
    this.validateForm(errors);
    if (errors.message) {
      return details;
    }
    details.set('User_Name', this.User_Name.value);
    details.set('Email_Address', this.Email_Address.value);
    details.set('Parent_Name', this.Parent_Name.value);
    details.set('Mobile_No', '0' + this.Mobile_No.value);
    return details;
  }
  get User_Name() {
    return this.parentForm.get('User_Name') as FormControl;
  }
  get Email_Address() {
    return this.parentForm.get('Email_Address') as FormControl;
  }
  get Parent_Name() {
    return this.parentForm.get('Parent_Name') as FormControl;
  }
  get Mobile_No() {
    return this.parentForm.get('Mobile_No') as FormControl;
  }
}
