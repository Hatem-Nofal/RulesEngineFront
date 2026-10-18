import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RulesBulkComponent } from './rules-bulk-component';

describe('RulesBulkComponent', () => {
  let component: RulesBulkComponent;
  let fixture: ComponentFixture<RulesBulkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RulesBulkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RulesBulkComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
