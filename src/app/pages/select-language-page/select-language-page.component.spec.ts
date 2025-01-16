import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectLanguagePageComponent } from './select-language-page.component';

describe('SelectLanguagePageComponent', () => {
  let component: SelectLanguagePageComponent;
  let fixture: ComponentFixture<SelectLanguagePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SelectLanguagePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectLanguagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
