import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiariesListComponent } from './beneficiaries-list.component';

describe('BeneficiariesListComponent', () => {
  let component: BeneficiariesListComponent;
  let fixture: ComponentFixture<BeneficiariesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiariesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeneficiariesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
