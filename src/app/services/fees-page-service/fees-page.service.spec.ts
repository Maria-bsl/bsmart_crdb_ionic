import { TestBed } from '@angular/core/testing';

import { FeesPageService } from './fees-page.service';

describe('FeesPageService', () => {
  let service: FeesPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeesPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
