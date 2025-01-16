import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddStudentFormComponent } from './add-student-form.component';

describe('AddStudentFormComponent', () => {
  let component: AddStudentFormComponent;
  let fixture: ComponentFixture<AddStudentFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AddStudentFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddStudentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
