import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PayWithMpesaComponent } from './pay-with-mpesa.component';

describe('PayWithMpesaComponent', () => {
  let component: PayWithMpesaComponent;
  let fixture: ComponentFixture<PayWithMpesaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PayWithMpesaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PayWithMpesaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
