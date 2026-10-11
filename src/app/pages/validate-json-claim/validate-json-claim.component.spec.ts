import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateJsonClaimComponent } from './validate-json-claim.component';

describe('ValidateJsonClaimComponent', () => {
  let component: ValidateJsonClaimComponent;
  let fixture: ComponentFixture<ValidateJsonClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateJsonClaimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateJsonClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
