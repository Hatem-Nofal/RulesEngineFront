import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormConfigListComponent } from './form-config-list-component';

describe('FormConfigListComponent', () => {
  let component: FormConfigListComponent;
  let fixture: ComponentFixture<FormConfigListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormConfigListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormConfigListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
