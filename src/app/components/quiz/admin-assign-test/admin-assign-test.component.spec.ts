import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAssignTestComponent } from './admin-assign-test.component';

describe('AdminAssignTestComponent', () => {
  let component: AdminAssignTestComponent;
  let fixture: ComponentFixture<AdminAssignTestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminAssignTestComponent]
    });
    fixture = TestBed.createComponent(AdminAssignTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
