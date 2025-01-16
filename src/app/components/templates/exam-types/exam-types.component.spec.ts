import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ExamTypesComponent } from './exam-types.component';

describe('ExamTypesComponent', () => {
  let component: ExamTypesComponent;
  let fixture: ComponentFixture<ExamTypesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ExamTypesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExamTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
