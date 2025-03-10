import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeaderSectionComponent } from './header-section.component';

describe('HeaderSectionComponent', () => {
  let component: HeaderSectionComponent;
  let fixture: ComponentFixture<HeaderSectionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HeaderSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderSectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
