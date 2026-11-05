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

  it('adds selected fields in selection order without default markers', () => {
    component.catalog.set([
      { id: 1, key: 'first', label: 'First' },
      { id: 2, key: 'second', label: 'Second' },
    ]);
    component.picked.set(new Set([1, 2]));

    component.addPicked();

    expect(component.selected().map(field => field.id)).toEqual([1, 2]);
    expect(component.selected().map(field => field.isDefault)).toEqual([undefined, undefined]);
  });
});
