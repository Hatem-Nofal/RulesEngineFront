import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomInputSearchComponent } from './custom-input-search.component';

describe('CustomInputSearchComponent', () => {
  let component: CustomInputSearchComponent;
  let fixture: ComponentFixture<CustomInputSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomInputSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomInputSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
