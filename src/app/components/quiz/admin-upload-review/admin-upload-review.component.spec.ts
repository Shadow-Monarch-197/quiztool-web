import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUploadReviewComponent } from './admin-upload-review.component';

describe('AdminUploadReviewComponent', () => {
  let component: AdminUploadReviewComponent;
  let fixture: ComponentFixture<AdminUploadReviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminUploadReviewComponent]
    });
    fixture = TestBed.createComponent(AdminUploadReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
