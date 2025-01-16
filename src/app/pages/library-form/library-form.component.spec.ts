import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LibraryFormComponent } from './library-form.component';

describe('LibraryFormComponent', () => {
  let component: LibraryFormComponent;
  let fixture: ComponentFixture<LibraryFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LibraryFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LibraryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
