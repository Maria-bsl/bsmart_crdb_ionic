import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SelectProfileFormComponent } from './select-profile-form.component';

describe('SelectProfileFormComponent', () => {
  let component: SelectProfileFormComponent;
  let fixture: ComponentFixture<SelectProfileFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SelectProfileFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectProfileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
