import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditProfileFormComponent } from './edit-profile-form.component';

describe('EditProfileFormComponent', () => {
  let component: EditProfileFormComponent;
  let fixture: ComponentFixture<EditProfileFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EditProfileFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditProfileFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
