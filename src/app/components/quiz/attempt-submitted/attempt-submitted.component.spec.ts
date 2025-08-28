import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttemptSubmittedComponent } from './attempt-submitted.component';

describe('AttemptSubmittedComponent', () => {
  let component: AttemptSubmittedComponent;
  let fixture: ComponentFixture<AttemptSubmittedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AttemptSubmittedComponent]
    });
    fixture = TestBed.createComponent(AttemptSubmittedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
