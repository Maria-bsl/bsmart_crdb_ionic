import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { MapsFormComponent } from './maps-form.component';

describe('MapsFormComponent', () => {
  let component: MapsFormComponent;
  let fixture: ComponentFixture<MapsFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [MapsFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MapsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
