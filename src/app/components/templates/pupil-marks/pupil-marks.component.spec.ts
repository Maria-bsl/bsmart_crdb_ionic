import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PupilMarksComponent } from './pupil-marks.component';

describe('PupilMarksComponent', () => {
  let component: PupilMarksComponent;
  let fixture: ComponentFixture<PupilMarksComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PupilMarksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PupilMarksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
