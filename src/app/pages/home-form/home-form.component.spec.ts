import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HomeFormComponent } from './home-form.component';

describe('HomeFormComponent', () => {
  let component: HomeFormComponent;
  let fixture: ComponentFixture<HomeFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HomeFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
