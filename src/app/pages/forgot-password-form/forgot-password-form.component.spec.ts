import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ForgotPasswordFormComponent } from './forgot-password-form.component';

describe('ForgotPasswordFormComponent', () => {
  let component: ForgotPasswordFormComponent;
  let fixture: ComponentFixture<ForgotPasswordFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ForgotPasswordFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
