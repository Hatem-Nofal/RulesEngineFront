import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomDropdownMultipleComponent } from './custom-dropdown-multiple.component';

describe('CustomDropdownMultipleComponent', () => {
  let component: CustomDropdownMultipleComponent;
  let fixture: ComponentFixture<CustomDropdownMultipleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomDropdownMultipleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomDropdownMultipleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
