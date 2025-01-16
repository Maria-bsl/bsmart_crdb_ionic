import { TestBed } from '@angular/core/testing';

import { PayWithMpesaService } from './pay-with-mpesa.service';

describe('PayWithMpesaService', () => {
  let service: PayWithMpesaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PayWithMpesaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
