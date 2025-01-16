import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TransportFormComponent } from './transport-form.component';

describe('TransportFormComponent', () => {
  let component: TransportFormComponent;
  let fixture: ComponentFixture<TransportFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [TransportFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TransportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
