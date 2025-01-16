import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ConfirmMessageBoxComponent } from './confirm-message-box.component';

describe('ConfirmMessageBoxComponent', () => {
  let component: ConfirmMessageBoxComponent;
  let fixture: ComponentFixture<ConfirmMessageBoxComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [ConfirmMessageBoxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmMessageBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
