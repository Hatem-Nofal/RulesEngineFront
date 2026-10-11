import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiaryFamilyTreeComponent } from './beneficiary-family-tree.component';

describe('BeneficiaryFamilyTreeComponent', () => {
  let component: BeneficiaryFamilyTreeComponent;
  let fixture: ComponentFixture<BeneficiaryFamilyTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiaryFamilyTreeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiaryFamilyTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
