import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DashboardFormComponent } from './dashboard-form.component';

describe('DashboardFormComponent', () => {
  let component: DashboardFormComponent;
  let fixture: ComponentFixture<DashboardFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [DashboardFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
