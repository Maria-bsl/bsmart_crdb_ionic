import { TestBed } from '@angular/core/testing';

import { AttendancePageService } from './attendance-page-service.service';

describe('AttendancePageServiceService', () => {
  let service: AttendancePageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AttendancePageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
