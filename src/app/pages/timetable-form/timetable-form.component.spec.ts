import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TimetableFormComponent } from './timetable-form.component';

describe('TimetableFormComponent', () => {
  let component: TimetableFormComponent;
  let fixture: ComponentFixture<TimetableFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TimetableFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimetableFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
