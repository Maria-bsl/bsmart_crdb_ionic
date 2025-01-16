import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResultsFormComponent } from './results-form.component';

describe('ResultsFormComponent', () => {
  let component: ResultsFormComponent;
  let fixture: ComponentFixture<ResultsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ResultsFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
