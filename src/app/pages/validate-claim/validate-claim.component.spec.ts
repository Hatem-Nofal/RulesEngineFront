import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ValidateClaimComponent } from './validate-claim.component';

describe('ValidateCliamComponent', () => {
  let component: ValidateClaimComponent;
  let fixture: ComponentFixture<ValidateClaimComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidateClaimComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ValidateClaimComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
