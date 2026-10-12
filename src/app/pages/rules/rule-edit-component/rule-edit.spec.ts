import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RuleEdit } from './rule-edit.component';

describe('RuleEdit', () => {
  let component: RuleEdit;
  let fixture: ComponentFixture<RuleEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RuleEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RuleEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
