import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FamilyFormCardComponent } from './family-form-card.component';

describe('FamilyFormCardComponent', () => {
  let component: FamilyFormCardComponent;
  let fixture: ComponentFixture<FamilyFormCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FamilyFormCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FamilyFormCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
