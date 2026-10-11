import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimsEditActivitiesComponent } from './claims-edit-activities.component';

describe('ClaimsEditActivitiesComponent', () => {
  let component: ClaimsEditActivitiesComponent;
  let fixture: ComponentFixture<ClaimsEditActivitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimsEditActivitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClaimsEditActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
