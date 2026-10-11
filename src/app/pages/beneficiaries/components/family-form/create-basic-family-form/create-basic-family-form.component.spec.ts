import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBasicFamilyFormComponent } from './create-basic-family-form.component';

describe('CreateBasicFamilyFormComponent', () => {
  let component: CreateBasicFamilyFormComponent;
  let fixture: ComponentFixture<CreateBasicFamilyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateBasicFamilyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateBasicFamilyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
