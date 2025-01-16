import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { BooksFormComponent } from './books-form.component';

describe('BooksFormComponent', () => {
  let component: BooksFormComponent;
  let fixture: ComponentFixture<BooksFormComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [BooksFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BooksFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
