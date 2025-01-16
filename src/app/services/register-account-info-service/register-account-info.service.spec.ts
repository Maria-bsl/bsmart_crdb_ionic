import { TestBed } from '@angular/core/testing';

import { RegisterAccountInfoService } from './register-account-info.service';

describe('RegisterAccountInfoService', () => {
  let service: RegisterAccountInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RegisterAccountInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
