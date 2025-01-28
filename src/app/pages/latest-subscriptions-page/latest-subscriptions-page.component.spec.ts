import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LatestSubscriptionsPageComponent } from './latest-subscriptions-page.component';

describe('LatestSubscriptionsPageComponent', () => {
  let component: LatestSubscriptionsPageComponent;
  let fixture: ComponentFixture<LatestSubscriptionsPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LatestSubscriptionsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LatestSubscriptionsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
