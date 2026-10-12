import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormConfigEditComponent } from './form-config-edit-component';

describe('FormConfigEditComponent', () => {
  let component: FormConfigEditComponent;
  let fixture: ComponentFixture<FormConfigEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormConfigEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormConfigEditComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
