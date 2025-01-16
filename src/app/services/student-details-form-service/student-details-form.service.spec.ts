import { TestBed } from '@angular/core/testing';

import { StudentDetailsFormService } from './student-details-form.service';

describe('StudentDetailsFormService', () => {
  let service: StudentDetailsFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentDetailsFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
