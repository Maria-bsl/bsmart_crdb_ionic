import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { selectLanguageGuard } from './select-language.guard';

describe('selectLanguageGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => selectLanguageGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
