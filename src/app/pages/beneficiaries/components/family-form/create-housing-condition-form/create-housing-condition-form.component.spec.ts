import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHousingConditionFormComponent } from './create-housing-condition-form.component';

describe('CreateHousingConditionFormComponent', () => {
  let component: CreateHousingConditionFormComponent;
  let fixture: ComponentFixture<CreateHousingConditionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateHousingConditionFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateHousingConditionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
