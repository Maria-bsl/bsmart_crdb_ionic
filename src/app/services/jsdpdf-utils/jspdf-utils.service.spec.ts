import { TestBed } from '@angular/core/testing';

import { JspdfUtilsService } from './jspdf-utils.service';

describe('JspdfUtilsService', () => {
  let service: JspdfUtilsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JspdfUtilsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
