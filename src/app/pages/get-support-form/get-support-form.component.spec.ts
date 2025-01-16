import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GetSupportFormComponent } from './get-support-form.component';

describe('GetSupportFormComponent', () => {
  let component: GetSupportFormComponent;
  let fixture: ComponentFixture<GetSupportFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GetSupportFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GetSupportFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
