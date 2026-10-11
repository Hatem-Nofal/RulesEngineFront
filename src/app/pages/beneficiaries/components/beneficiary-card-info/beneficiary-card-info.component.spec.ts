import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryCardInfoComponent } from './beneficiary-card-info.component';

describe('BeneficiaryCardInfoComponent', () => {
  let component: BeneficiaryCardInfoComponent;
  let fixture: ComponentFixture<BeneficiaryCardInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiaryCardInfoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiaryCardInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
