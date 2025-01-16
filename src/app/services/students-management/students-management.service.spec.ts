import { TestBed } from '@angular/core/testing';

import { StudentsManagementService } from './students-management.service';

describe('StudentsManagementService', () => {
  let service: StudentsManagementService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StudentsManagementService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
