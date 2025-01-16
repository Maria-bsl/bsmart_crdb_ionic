import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FeesFormComponent } from './fees-form.component';

describe('FeesFormComponent', () => {
  let component: FeesFormComponent;
  let fixture: ComponentFixture<FeesFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FeesFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FeesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
