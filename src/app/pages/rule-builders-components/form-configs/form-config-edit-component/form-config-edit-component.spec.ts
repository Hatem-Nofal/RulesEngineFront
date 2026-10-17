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

  it('allows exactly two fields to be marked as default', () => {
    component.selected.set([
      { id: 'field-1', isDefault: false },
      { id: 'field-2', isDefault: false },
      { id: 'field-3', isDefault: false },
    ]);

    component.setDefault(0, true);
    component.setDefault(1, true);
    component.setDefault(2, true);

    expect(component.defaultCount()).toBe(2);
    expect(component.selected().map(field => field.isDefault)).toEqual([true, true, false]);
  });

  it('allows changing which two fields are marked as default', () => {
    component.selected.set([
      { id: 'field-1', isDefault: true },
      { id: 'field-2', isDefault: true },
      { id: 'field-3', isDefault: false },
    ]);

    component.setDefault(0, false);
    component.setDefault(2, true);

    expect(component.defaultCount()).toBe(2);
    expect(component.selected().map(field => field.isDefault)).toEqual([false, true, true]);
  });
});
