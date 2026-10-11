import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiariesSearchComponent } from './beneficiaries-search.component';

describe('BeneficiariesSearchComponent', () => {
  let component: BeneficiariesSearchComponent;
  let fixture: ComponentFixture<BeneficiariesSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiariesSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiariesSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
