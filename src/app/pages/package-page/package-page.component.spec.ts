import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PackagePageComponent } from './package-page.component';

describe('PackagePageComponent', () => {
  let component: PackagePageComponent;
  let fixture: ComponentFixture<PackagePageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [PackagePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PackagePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
